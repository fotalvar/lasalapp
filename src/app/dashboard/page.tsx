"use client";

import {
  Users,
  Theater,
  Calendar as CalendarIcon,
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
    <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          Progreso del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {memberProgress.map((member) => {
            const status = getProgressStatus(member);
            const radius = 28;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset =
              circumference - (member.progress / 100) * circumference;

            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl border transition-smooth hover:shadow-md backdrop-blur-sm",
                  "bg-white/30 border-white/50 hover:bg-white/40"
                )}
              >
                {/* Circular Progress */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="transform -rotate-90"
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                  >
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke={status.strokeColor}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  {/* Center percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-xs font-bold", status.color)}>
                      {Math.round(member.progress)}%
                    </span>
                  </div>
                </div>

                {/* Member info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar
                      className="h-6 w-6 text-white flex-shrink-0"
                      style={{ backgroundColor: member.avatar.color }}
                    >
                      <AvatarFallback className="bg-transparent">
                        <MemberIcon member={member} className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium truncate text-gray-800">
                      {member.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {member.taskCount > 0 ? (
                      <>
                        <p className="text-xs text-gray-600">
                          {member.completedCount}/{member.taskCount}
                        </p>
                        {member.overdueCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-4 px-1"
                          >
                            {member.overdueCount} caducada
                            {member.overdueCount !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-600">Sin tareas</p>
                    )}
                  </div>
                </div>

                {/* Status Icon */}
                <div
                  className={cn(
                    "p-2 rounded-full flex-shrink-0",
                    status.bgColor
                  )}
                >
                  <div className={status.color}>{status.icon}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Nueva función unificada de Agenda
function MyAgendaWidget({
  events,
  member,
  teamMembers,
}: {
  events: CalendarEvent[];
  member: TeamMember | null;
  teamMembers: TeamMember[];
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null); // Organizar eventos por días
  const eventsByDay = useMemo(() => {
    if (!member) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filtrar eventos relevantes (del usuario y no archivados, o eventos generales)
    const relevantEvents = events.filter((event) => {
      if (event.archived) return false;

      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);

      // Incluir si es una tarea asignada al usuario
      if (event.assigneeIds && event.assigneeIds.includes(member.id)) {
        return true;
      }

      // Incluir eventos generales (sin assigneeIds) que sean de hoy o futuros
      if (!event.assigneeIds || event.assigneeIds.length === 0) {
        return eventDate >= now;
      }

      return false;
    });

    // Agrupar por fecha
    const grouped = new Map<string, CalendarEvent[]>();

    relevantEvents.forEach((event) => {
      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      const dayKey = format(eventDate, "yyyy-MM-dd");

      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)!.push(event);
    });

    // Convertir a array y ordenar
    const days = Array.from(grouped.entries())
      .map(([dayKey, dayEvents]) => ({
        date: new Date(dayKey),
        events: dayEvents.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        }),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Mostrar solo los próximos 7 días
    return days.slice(0, 7);
  }, [events, member]);

  // Tareas archivadas
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
        const aDate = (a as any).archivedAt;
        const bDate = (b as any).archivedAt;
        if (aDate && bDate) {
          const dateA = aDate instanceof Date ? aDate : new Date(aDate);
          const dateB = bDate instanceof Date ? bDate : new Date(bDate);
          return dateB.getTime() - dateA.getTime();
        }
        if (aDate) return -1;
        if (bDate) return 1;
        return b.date.getTime() - a.date.getTime();
      });
  }, [events, member]);

  const getTaskStatus = (task: CalendarEvent): string => {
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

  const handleArchive = async (taskId: string) => {
    if (!db) return;
    try {
      const taskRef = doc(db, "events", taskId);
      await setDoc(
        taskRef,
        { archived: true, archivedAt: new Date() },
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
        { archived: false, archivedAt: null },
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

  const getDayLabel = (date: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);

    if (dayDate.getTime() === now.getTime()) {
      return "Hoy";
    } else if (dayDate.getTime() === tomorrow.getTime()) {
      return "Mañana";
    } else {
      return format(date, "EEEE, d 'de' MMMM", { locale: es });
    }
  };

  if (!member) {
    return (
      <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
            </div>
            Mi Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/50 mb-3">
              <CalendarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Selecciona un usuario
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
          </div>
          Mi Agenda
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600">
          Tareas y eventos organizados cronológicamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventsByDay.length > 0 ? (
          <div className="space-y-6">
            {eventsByDay.map((day, dayIndex) => {
              const now = new Date();
              const isToday =
                format(day.date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

              return (
                <div key={dayIndex} className="space-y-3">
                  {/* Día header */}
                  <div
                    className={cn(
                      "flex items-center gap-2 pb-2 border-b",
                      isToday ? "border-purple-400/50" : "border-white/30"
                    )}
                  >
                    <h3
                      className={cn(
                        "font-semibold text-sm capitalize",
                        isToday ? "text-purple-700" : "text-gray-700"
                      )}
                    >
                      {getDayLabel(day.date)}
                    </h3>
                    <Badge
                      variant={isToday ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        isToday &&
                          "bg-gradient-to-r from-purple-500 to-pink-500"
                      )}
                    >
                      {day.events.length}
                    </Badge>
                  </div>

                  {/* Eventos del día */}
                  <div className="space-y-2">
                    {day.events.map((event) => {
                      const config = eventConfig[event.type] || {
                        icon: <CalendarIcon className="h-4 w-4" />,
                        color: "text-gray-600",
                        bgColor: "bg-gray-100",
                      };

                      const eventDate =
                        event.date instanceof Date
                          ? event.date
                          : new Date(event.date);
                      const isTask =
                        event.assigneeIds &&
                        event.assigneeIds.includes(member.id);
                      const isOverdue = !event.completed && eventDate < now;
                      const daysOverdue = isOverdue
                        ? differenceInDays(now, eventDate)
                        : 0;

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border transition-smooth backdrop-blur-sm",
                            isOverdue
                              ? "bg-red-100/40 border-red-300/60"
                              : "bg-white/30 border-white/50 hover:bg-white/40 hover:shadow-md"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-full p-2 flex-shrink-0",
                              isOverdue ? "bg-red-200/60" : config.bgColor
                            )}
                          >
                            <div
                              className={
                                isOverdue ? "text-red-600" : config.color
                              }
                            >
                              {config.icon}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "font-medium text-sm text-gray-800",
                                event.completed && "line-through text-gray-500",
                                isOverdue && "text-red-700"
                              )}
                            >
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <p
                                className={cn(
                                  "text-xs text-gray-600",
                                  isOverdue
                                    ? "text-red-600 font-medium"
                                    : "text-muted-foreground"
                                )}
                              >
                                {format(eventDate, "HH:mm", { locale: es })}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                ·
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {event.type}
                              </p>
                              {isTask && (
                                <Badge
                                  variant={
                                    event.completed ? "default" : "secondary"
                                  }
                                  className="text-[10px] h-5 px-1.5"
                                >
                                  {event.completed
                                    ? "Completada"
                                    : event.status || "Pendiente"}
                                </Badge>
                              )}
                              {isOverdue && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] h-5 px-1.5"
                                >
                                  {daysOverdue}{" "}
                                  {daysOverdue === 1 ? "día" : "días"} de
                                  retraso
                                </Badge>
                              )}
                            </div>
                          </div>

                          {isTask && (
                            <div className="flex gap-2 flex-shrink-0">
                              <Select
                                value={getTaskStatus(event)}
                                onValueChange={(value: any) => {
                                  if (
                                    value === "Pendiente" ||
                                    value === "En Progreso" ||
                                    value === "Completada"
                                  ) {
                                    handleStatusChange(event.id, value);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[140px] h-8">
                                  <SelectValue>
                                    {getTaskStatus(event)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pendiente">
                                    Pendiente
                                  </SelectItem>
                                  <SelectItem value="En Progreso">
                                    En Progreso
                                  </SelectItem>
                                  <SelectItem value="Completada">
                                    Completada
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {event.completed && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleArchive(event.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Archivar"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/50 mb-3">
              <CalendarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              No hay eventos próximos
            </p>
            <p className="text-xs text-gray-600 mt-1">Tu agenda está limpia</p>
          </div>
        )}

        {/* Tareas Archivadas */}
        {archivedTasks.length > 0 && (
          <div className="pt-6 border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="archived-tasks" className="border-none">
                <AccordionTrigger className="hover:no-underline py-3 px-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    Tareas Archivadas ({archivedTasks.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 pt-2">
                    {archivedTasks.map((task) => {
                      const config = eventConfig[task.type] || {
                        icon: <CalendarIcon className="h-4 w-4" />,
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
                          className="flex items-start gap-3 p-3 rounded-xl border bg-white/20 border-white/40 backdrop-blur-sm"
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
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
    <div className="flex-1 min-h-screen">
      {/* Notifications Bar */}
      {pendingProposalsCount > 0 && (
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-6">
          <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-lg animate-fade-in">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-400/40 backdrop-blur-sm flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-700" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-800 font-semibold text-base mb-1">
                  {pendingProposalsCount === 1
                    ? "Hay 1 propuesta pendiente"
                    : `Hay ${pendingProposalsCount} propuestas pendientes`}
                </h3>
                <p className="text-gray-700 text-sm">
                  {pendingProposalsCount === 1
                    ? "Tienes una propuesta de espectáculo que requiere tu atención para programarla."
                    : `Tienes ${pendingProposalsCount} propuestas de espectáculo que requieren tu atención para programarlas.`}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => router.push("/dashboard/programming")}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Ver Programación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="px-6 md:px-8 py-6 space-y-8">
        {permissionError && (
          <Alert
            variant="destructive"
            className="bg-white/40 backdrop-blur-md border-white/60 shadow-xl animate-fade-in"
          >
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

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          {/* Left Column - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MyAgendaWidget
              events={allEvents}
              member={selectedTeamUser}
              teamMembers={teamMembers}
            />
          </div>

          {/* Right Column - Team Progress */}
          <div className="lg:col-span-1">
            <TeamProgressWidget teamMembers={teamMembers} events={allEvents} />
          </div>
        </div>
      </main>
    </div>
  );
}
