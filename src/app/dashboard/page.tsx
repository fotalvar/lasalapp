"use client";

import {
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  LogOut,
  Building,
  Megaphone,
  Ticket,
  Music,
  Clock,
  CheckCircle2,
  Circle,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTeamUser } from "@/context/team-user-context";
import { useState, useEffect, useMemo } from "react";
import type { TeamMember, CalendarEvent, Show } from "@/lib/types";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { errorEmitter, FirestorePermissionError } from "@/firebase";

const eventIcons: { [key: string]: React.ElementType } = {
  Espectáculos: Theater,
  "Publicaciones en redes": Megaphone,
  "Venta de entradas": Ticket,
  "Reunión de Equipo": Users,
  "Reunión Externa": Users,
  Ensayos: Music,
  "Tarea de laSala": Clock,
};

const eventConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  "Publicaciones en redes": {
    icon: <Megaphone className="h-4 w-4" />,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  "Venta de entradas": {
    icon: <Ticket className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  Espectáculos: {
    icon: <Theater className="h-4 w-4" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  "Reunión de Equipo": {
    icon: <Users className="h-4 w-4" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  "Reunión Externa": {
    icon: <Users className="h-4 w-4" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  Ensayos: {
    icon: <Music className="h-4 w-4" />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  "Tarea de laSala": {
    icon: <Clock className="h-4 w-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
};

function MemberIcon({
  member,
  className,
}: {
  member: TeamMember;
  className?: string;
}) {
  const IconComponent = (LucideIcons as any)[
    member.avatar.icon
  ] as React.ElementType;
  if (!IconComponent)
    return <LucideIcons.User className={cn("h-5 w-5", className)} />;
  return <IconComponent className={cn("h-5 w-5", className)} />;
}

function TeamProgressWidget({
  teamMembers,
  events,
}: {
  teamMembers: TeamMember[];
  events: CalendarEvent[];
}) {
  const memberProgress = useMemo(() => {
    const now = new Date();
    return teamMembers.map((member) => {
      // Contar eventos asignados a este miembro (tareas) que no estén archivadas
      const memberEvents = events.filter(
        (event) =>
          event.assigneeIds &&
          event.assigneeIds.includes(member.id) &&
          !event.archived
      );

      if (memberEvents.length === 0) {
        return {
          ...member,
          progress: 100,
          taskCount: 0,
          completedCount: 0,
          pendingCount: 0,
          overdueCount: 0,
        };
      }

      const completedEvents = memberEvents.filter(
        (event) => event.completed || event.status === "Completada"
      );
      const inProgressEvents = memberEvents.filter(
        (event) => event.status === "En Progreso" && !event.completed
      );
      const pendingEvents = memberEvents.filter(
        (event) =>
          !event.completed &&
          event.status !== "Completada" &&
          event.status !== "En Progreso"
      );
      const overdueEvents = pendingEvents.filter((event) => {
        const taskDate =
          event.date instanceof Date ? event.date : new Date(event.date);
        return taskDate < now;
      });

      console.log(`Member ${member.name}:`, {
        total: memberEvents.length,
        completed: completedEvents.length,
        inProgress: inProgressEvents.length,
        pending: pendingEvents.length,
        overdue: overdueEvents.length,
      });

      // Calculate progress: completed = 100%, in progress = 50%
      const totalProgress =
        completedEvents.length * 100 + inProgressEvents.length * 50;
      const progress = totalProgress / memberEvents.length;

      return {
        ...member,
        progress,
        taskCount: memberEvents.length,
        completedCount: completedEvents.length,
        pendingCount: pendingEvents.length,
        overdueCount: overdueEvents.length,
      };
    });
  }, [teamMembers, events]);

  function MemberIcon({
    member,
    className,
  }: {
    member: TeamMember;
    className?: string;
  }) {
    const IconComponent = (LucideIcons as any)[
      member.avatar.icon
    ] as React.ElementType;
    if (!IconComponent)
      return <LucideIcons.User className={cn("h-5 w-5", className)} />;
    return <IconComponent className={cn("h-5 w-5", className)} />;
  }

  // Helper function to determine progress color and icon
  const getProgressStatus = (member: any) => {
    if (member.overdueCount > 0) {
      return {
        color: "text-red-500",
        strokeColor: "#ef4444",
        icon: <AlertCircle className="h-5 w-5" />,
        bgColor: "bg-red-50",
      };
    }
    if (member.progress === 100) {
      return {
        color: "text-green-500",
        strokeColor: "#22c55e",
        icon: <CheckCircle2 className="h-5 w-5" />,
        bgColor: "bg-green-50",
      };
    }
    // Si hay tareas completadas o en progreso, mostrar amarillo
    if (member.completedCount > 0 || member.progress > 0) {
      return {
        color: "text-amber-500",
        strokeColor: "#f59e0b",
        icon: <Clock className="h-5 w-5" />,
        bgColor: "bg-amber-50",
      };
    }
    // Rojo solo si todas están pendientes (sin progreso)
    return {
      color: "text-red-500",
      strokeColor: "#ef4444",
      icon: <Circle className="h-5 w-5" />,
      bgColor: "bg-red-50",
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso del Equipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memberProgress.map((member) => {
            const status = getProgressStatus(member);
            const radius = 35; // Further reduced to prevent clipping
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset =
              circumference - (member.progress / 100) * circumference;

            return (
              <Card
                key={member.id}
                className={cn("border-2 shadow-sm", status.bgColor)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center gap-3">
                    {/* Circular Progress */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg
                        className="transform -rotate-90"
                        width="76"
                        height="76"
                        viewBox="0 0 76 76"
                      >
                        {/* Background circle */}
                        <circle
                          cx="38"
                          cy="38"
                          r={radius}
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="38"
                          cy="38"
                          r={radius}
                          stroke={status.strokeColor}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      {/* Center icon */}
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          status.color
                        )}
                      >
                        {status.icon}
                      </div>
                    </div>

                    {/* Member info */}
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Avatar
                          className="h-6 w-6 text-white"
                          style={{ backgroundColor: member.avatar.color }}
                        >
                          <AvatarFallback className="bg-transparent">
                            <MemberIcon member={member} className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                      </div>
                      {member.taskCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {member.completedCount}/{member.taskCount} completadas
                        </p>
                      )}
                      {member.overdueCount > 0 && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {member.overdueCount} caducada
                          {member.overdueCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MyTasksWidget({
  events,
  member,
}: {
  events: CalendarEvent[];
  member: TeamMember | null;
}) {
  const db = useFirestore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const userTasks = useMemo(() => {
    if (!member) return [];
    return events.filter(
      (event) =>
        event.assigneeIds &&
        event.assigneeIds.includes(member.id) &&
        !event.archived
    );
  }, [events, member]);

  const archivedTasks = useMemo(() => {
    if (!member) return [];
    return events
      .filter(
        (event) =>
          event.assigneeIds &&
          event.assigneeIds.includes(member.id) &&
          event.archived === true
      )
      .sort((a, b) => {
        // Sort by archivedAt date, most recent first
        const aDate = (a as any).archivedAt;
        const bDate = (b as any).archivedAt;

        // If both have archivedAt dates
        if (aDate && bDate) {
          const dateA = aDate instanceof Date ? aDate : new Date(aDate);
          const dateB = bDate instanceof Date ? bDate : new Date(bDate);
          return dateB.getTime() - dateA.getTime(); // Most recent first
        }

        // If only one has archivedAt, prioritize the one with date
        if (aDate) return -1;
        if (bDate) return 1;

        // If neither has archivedAt, sort by event date
        return b.date.getTime() - a.date.getTime();
      });
  }, [events, member]);

  const completedCount = useMemo(
    () =>
      userTasks.filter((task) => task.completed || task.status === "Completada")
        .length,
    [userTasks]
  );
  const totalCount = userTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Helper function to get the computed status of a task
  const getTaskStatus = (
    task: CalendarEvent
  ): "Pendiente" | "En Progreso" | "Completada" | "Caducada" | "Archivada" => {
    if (task.archived) return "Archivada";
    if (task.status === "Completada" || task.completed) return "Completada";

    const now = new Date();
    const taskDate =
      task.date instanceof Date ? task.date : new Date(task.date);
    const isOverdue = taskDate < now;

    if (isOverdue && !task.completed) return "Caducada";

    return task.status || "Pendiente";
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: "Pendiente" | "En Progreso" | "Completada"
  ) => {
    if (!db) return;

    try {
      const taskRef = doc(db, "events", taskId);
      const updateData: any = { status: newStatus };

      // Update completed flag based on status
      if (newStatus === "Completada") {
        updateData.completed = true;
      } else {
        updateData.completed = false;
      }

      await setDoc(taskRef, updateData, { merge: true });
    } catch (error: any) {
      console.error("Error updating task status:", error);
      if (error.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `events/${taskId}`,
            operation: "update",
            requestResourceData: { status: newStatus },
          })
        );
      }
    }
  };

  const handleUpdate = async (taskId: string, completed: boolean) => {
    if (!db) return;

    try {
      const taskRef = doc(db, "events", taskId);
      const status = completed ? "Completada" : "Pendiente";
      await setDoc(taskRef, { completed, status }, { merge: true });
    } catch (error: any) {
      console.error("Error updating task:", error);
      if (error.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `events/${taskId}`,
            operation: "update",
            requestResourceData: { completed },
          })
        );
      }
    }
  };

  const handleArchive = async (taskId: string) => {
    if (!db) return;

    try {
      const taskRef = doc(db, "events", taskId);
      await setDoc(
        taskRef,
        {
          archived: true,
          archivedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error: any) {
      console.error("Error archiving task:", error);
      if (error.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `events/${taskId}`,
            operation: "update",
            requestResourceData: { archived: true },
          })
        );
      }
    }
  };

  const handleUnarchive = async (taskId: string) => {
    if (!db) return;

    try {
      const taskRef = doc(db, "events", taskId);
      await setDoc(
        taskRef,
        {
          archived: false,
          archivedAt: null,
        },
        { merge: true }
      );
    } catch (error: any) {
      console.error("Error unarchiving task:", error);
      if (error.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `events/${taskId}`,
            operation: "update",
            requestResourceData: { archived: false },
          })
        );
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!db || !taskToDelete) return;

    try {
      const taskRef = doc(db, "events", taskToDelete);
      await deleteDoc(taskRef);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error: any) {
      console.error("Error deleting task:", error);
      if (error.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `events/${taskToDelete}`,
            operation: "delete",
            requestResourceData: {},
          })
        );
      }
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  if (!member) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Selecciona un usuario
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar
            className="h-12 w-12 text-white"
            style={{ backgroundColor: member.avatar.color }}
          >
            <AvatarFallback className="bg-transparent">
              <MemberIcon member={member} className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{member.name}</CardTitle>
            <CardDescription>
              {completedCount} de {totalCount} tareas completadas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {userTasks.length > 0 ? (
          <>
            <div className="space-y-2">
              {userTasks.map((task) => {
                const config = eventConfig[task.type] || {
                  icon: <Calendar className="h-4 w-4" />,
                  color: "text-gray-600",
                  bgColor: "bg-gray-100",
                };

                const now = new Date();
                const taskDate =
                  task.date instanceof Date ? task.date : new Date(task.date);
                const isOverdue = !task.completed && taskDate < now;
                const daysOverdue = isOverdue
                  ? differenceInDays(now, taskDate)
                  : 0;

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      isOverdue ? "bg-red-50 border-red-200" : "bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full p-2 flex-shrink-0",
                        isOverdue ? "bg-red-100" : config.bgColor
                      )}
                    >
                      <div
                        className={isOverdue ? "text-red-600" : config.color}
                      >
                        {config.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          task.completed &&
                            "line-through text-muted-foreground",
                          isOverdue && "text-red-700"
                        )}
                      >
                        {task.title}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          isOverdue
                            ? "text-red-600 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {isOverdue ? (
                          <>
                            Tarea Pendiente · {daysOverdue}{" "}
                            {daysOverdue === 1 ? "día" : "días"} de retraso
                          </>
                        ) : (
                          format(taskDate, "eeee, d 'de' MMMM", { locale: es })
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Select
                        value={getTaskStatus(task)}
                        onValueChange={(value: any) => {
                          if (
                            value === "Pendiente" ||
                            value === "En Progreso" ||
                            value === "Completada"
                          ) {
                            handleStatusChange(task.id, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue>{getTaskStatus(task)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="En Progreso">
                            En Progreso
                          </SelectItem>
                          <SelectItem value="Completada">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                      {task.completed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArchive(task.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Archivar"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tienes tareas asignadas
          </p>
        )}

        {/* Archived Tasks Section - Collapsible Accordion */}
        <div className="mt-6 pt-6 border-t">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="archived-tasks" className="border-none">
              <AccordionTrigger className="hover:no-underline py-3 px-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  Tareas Archivadas ({archivedTasks.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {archivedTasks.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 pt-2">
                    {archivedTasks.map((task) => {
                      const config = eventConfig[task.type] || {
                        icon: <Calendar className="h-4 w-4" />,
                        color: "text-gray-600",
                        bgColor: "bg-gray-100",
                      };

                      const taskDate =
                        task.date instanceof Date
                          ? task.date
                          : new Date(task.date);

                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                        >
                          <div
                            className={cn(
                              "rounded-full p-2 flex-shrink-0 opacity-60",
                              config.bgColor
                            )}
                          >
                            <div className={config.color}>{config.icon}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-through text-muted-foreground">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(taskDate, "eeee, d 'de' MMMM", {
                                locale: es,
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnarchive(task.id)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Desarchivar"
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(task.id)}
                              className="text-muted-foreground hover:text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay tareas archivadas
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la tarea de la base de
              datos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default function DashboardPage() {
  const { selectedTeamUser } = useTeamUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  const [pendingProposalsCount, setPendingProposalsCount] = useState(0);

  // Fetch all team members
  const teamMembersQuery = useMemoFirebase(
    () => (db ? collection(db, "teamMembers") : null),
    [db]
  );
  const { data: fetchedMembers, error: membersError } =
    useCollection<TeamMember>(teamMembersQuery);

  // Fetch all events (para el progreso del equipo)
  const allEventsQuery = useMemoFirebase(
    () => (db ? collection(db, "events") : null),
    [db]
  );
  const { data: fetchedAllEvents, error: allEventsError } =
    useCollection<CalendarEvent>(allEventsQuery);

  // Fetch shows to check for pending proposals
  const showsQuery = useMemoFirebase(
    () => (db ? collection(db, "shows") : null),
    [db]
  );
  const { data: fetchedShows, error: showsError } =
    useCollection<Show>(showsQuery);

  // Fetch my upcoming events
  const myEventsQuery = useMemoFirebase(() => {
    if (!db || !selectedTeamUser) return null;
    // Simplified query without orderBy to avoid needing composite index
    // We'll sort in memory instead
    return query(
      collection(db, "events"),
      where("assigneeIds", "array-contains", selectedTeamUser.id),
      limit(10) // Get more to ensure we have enough after filtering
    );
  }, [db, selectedTeamUser]);
  const { data: fetchedMyEvents, error: eventsError } =
    useCollection<CalendarEvent>(myEventsQuery);

  // Check for pending proposals
  useEffect(() => {
    if (fetchedShows) {
      const pendingProposals = fetchedShows.filter(
        (show) => show.status === "Proposta Pendent"
      );
      setPendingProposalsCount(pendingProposals.length);
    }
  }, [fetchedShows]);

  // Check for permission errors
  useEffect(() => {
    if (membersError || allEventsError || eventsError) {
      const errorMessage =
        membersError?.message ||
        allEventsError?.message ||
        eventsError?.message ||
        "";
      if (
        errorMessage.includes("permission") ||
        errorMessage.includes("insufficient")
      ) {
        setPermissionError(true);
        toast({
          title: "Error de permisos",
          description:
            "Hay un problema con las reglas de Firestore. Por favor, contacta al administrador del sistema.",
          variant: "destructive",
        });
      }
    }
  }, [membersError, allEventsError, eventsError, toast]);

  useEffect(() => {
    if (fetchedMembers) setTeamMembers(fetchedMembers);
  }, [fetchedMembers]);

  useEffect(() => {
    if (fetchedAllEvents) {
      // Filtrar solo eventos que tengan assigneeIds (son tareas) - incluir archivadas
      const tasksOnly = fetchedAllEvents
        .filter((event) => event.assigneeIds && event.assigneeIds.length > 0)
        .map((e) => ({
          ...e,
          date: e.date instanceof Timestamp ? e.date.toDate() : e.date,
        }));
      setAllEvents(tasksOnly);
    }
  }, [fetchedAllEvents]);

  useEffect(() => {
    if (fetchedMyEvents) {
      const now = new Date();
      // Filter for upcoming events and sort by date
      const upcomingEvents = fetchedMyEvents
        .map((e) => ({
          ...e,
          date: e.date instanceof Timestamp ? e.date.toDate() : e.date,
        }))
        .filter((e) => e.date >= now) // Only future events
        .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort ascending
        .slice(0, 3); // Take top 3

      setMyEvents(upcomingEvents);
    }
  }, [fetchedMyEvents]);

  return (
    <div className="flex-1">
      {/* Top Bar for Pending Proposals */}
      {pendingProposalsCount > 0 && (
        <div className="bg-[#eab308] text-white py-3 px-4 md:px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm md:text-base">
                {pendingProposalsCount === 1
                  ? "Hay 1 propuesta pendiente"
                  : `Hay ${pendingProposalsCount} propuestas pendientes`}
              </p>
              <p className="text-xs md:text-sm opacity-90">
                {pendingProposalsCount === 1
                  ? "Tienes una propuesta de espectáculo que requiere tu atención para programarla."
                  : `Tienes ${pendingProposalsCount} propuestas de espectáculo que requieren tu atención para programarlas.`}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/programming")}
            variant="secondary"
            size="sm"
            className="bg-white text-[#eab308] hover:bg-gray-100 flex-shrink-0"
          >
            Ver Programación
          </Button>
        </div>
      )}

      <main className="p-4 md:p-6">
        {permissionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Permisos de Firestore</AlertTitle>
            <AlertDescription>
              No se pueden cargar los datos debido a un error en las reglas de
              seguridad de Firestore.
              <br />
              <strong>Solución:</strong> Un administrador del proyecto Firebase
              debe actualizar las reglas de seguridad.
              <br />
              <span className="text-xs mt-2 block">
                Proyecto: studio-3324096154-db37c |
                <a
                  href="https://console.firebase.google.com/project/studio-3324096154-db37c/firestore/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  Ir a Firebase Console
                </a>
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <MyTasksWidget events={allEvents} member={selectedTeamUser} />
          <TeamProgressWidget teamMembers={teamMembers} events={allEvents} />
        </div>
      </main>
    </div>
  );
}
