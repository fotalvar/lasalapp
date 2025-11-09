"use client";

import { useState, useEffect, useMemo } from "react";
import type { CalendarEvent, TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  TrendingUp,
  Users,
  Filter,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from "@/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Theater, Megaphone, Ticket, Music } from "lucide-react";
import {
  format,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { deleteDoc } from "firebase/firestore";

const eventConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string; textColor: string }
> = {
  "Publicaciones en redes": {
    icon: <Megaphone className="h-4 w-4" />,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
    textColor: "text-sky-700",
  },
  "Venta de entradas": {
    icon: <Ticket className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  Espectáculos: {
    icon: <Theater className="h-4 w-4" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
  },
  "Reunión de Equipo": {
    icon: <Users className="h-4 w-4" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
  },
  "Reunión Externa": {
    icon: <Users className="h-4 w-4" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  Ensayos: {
    icon: <Music className="h-4 w-4" />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  "Tarea de laSala": {
    icon: <Clock className="h-4 w-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
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

export default function TasksDashboard() {
  const db = useFirestore();
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Fetch team members
  const membersQuery = useMemoFirebase(
    () => (db ? collection(db, "teamMembers") : null),
    [db]
  );
  const { data: teamMembers, isLoading: membersLoading } =
    useCollection<TeamMember>(membersQuery);

  // Fetch all events (tasks)
  const eventsQuery = useMemoFirebase(
    () => (db ? collection(db, "events") : null),
    [db]
  );
  const { data: allEvents, isLoading: eventsLoading } =
    useCollection<CalendarEvent>(eventsQuery);

  // Filter only tasks (events with assignees) - include archived
  const tasks = useMemo(() => {
    if (!allEvents) return [];
    return allEvents
      .filter((event) => event.assigneeIds && event.assigneeIds.length > 0)
      .map((e) => {
        // Convert date to Date object and validate
        let date: Date;
        if (e.date instanceof Date) {
          date = e.date;
        } else if (e.date && typeof e.date === "object" && "toDate" in e.date) {
          // Handle Firestore Timestamp objects
          date = (e.date as any).toDate();
        } else if (e.date) {
          date = new Date(e.date);
        } else {
          date = new Date(); // Fallback to current date if no date is provided
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          date = new Date(); // Fallback to current date if date is invalid
        }

        return {
          ...e,
          date,
        };
      });
  }, [allEvents]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter((t) => !t.completed && t.date < now).length;
    const thisWeek = tasks.filter((t) => {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      return isWithinInterval(t.date, { start: weekStart, end: weekEnd });
    }).length;

    return { total, completed, pending, overdue, thisWeek };
  }, [tasks]);

  // Group tasks by member
  const tasksByMember = useMemo(() => {
    if (!teamMembers) return [];

    const now = new Date();

    return teamMembers.map((member) => {
      const memberTasks = tasks.filter(
        (task) =>
          task.assigneeIds &&
          task.assigneeIds.includes(member.id) &&
          !task.archived
      );

      const completed = memberTasks.filter((t) => t.completed).length;
      const pending = memberTasks.filter((t) => !t.completed).length;
      const overdue = memberTasks.filter(
        (t) => !t.completed && t.date < now
      ).length;
      const progress =
        memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 100;

      return {
        member,
        tasks: memberTasks,
        total: memberTasks.length,
        completed,
        pending,
        overdue,
        progress,
      };
    });
  }, [teamMembers, tasks]);

  // Filtered tasks for table
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (selectedMember !== "all") {
      filtered = filtered.filter(
        (task) => task.assigneeIds && task.assigneeIds.includes(selectedMember)
      );
    }

    if (selectedStatus === "completed") {
      filtered = filtered.filter((t) => t.completed && !t.archived);
    } else if (selectedStatus === "pending") {
      filtered = filtered.filter((t) => !t.completed && !t.archived);
    } else if (selectedStatus === "overdue") {
      const now = new Date();
      filtered = filtered.filter(
        (t) => !t.completed && t.date < now && !t.archived
      );
    } else if (selectedStatus === "archived") {
      filtered = filtered.filter((t) => t.archived === true);
    } else if (selectedStatus === "all") {
      // Show only non-archived tasks by default
      filtered = filtered.filter((t) => !t.archived);
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, selectedMember, selectedStatus]);

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    if (!db) return;

    try {
      const taskRef = doc(db, "events", taskId);
      await setDoc(taskRef, { completed }, { merge: true });
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

  if (membersLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main content: Tasks table and Team Progress side by side */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Filters and Task Table - Main section */}
        <Card className="shadow-md border-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Todas las Tareas
              </CardTitle>
              <div className="flex gap-2">
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las personas</SelectItem>
                    {teamMembers?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                    <SelectItem value="overdue">Caducadas</SelectItem>
                    <SelectItem value="archived">Archivadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay tareas que coincidan con los filtros seleccionados
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Asignado a</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => {
                      const config = eventConfig[task.type];
                      const now = new Date();
                      const isOverdue = !task.completed && task.date < now;
                      const daysOverdue = isOverdue
                        ? differenceInDays(now, task.date)
                        : 0;
                      const assignees = teamMembers?.filter(
                        (m) =>
                          task.assigneeIds && task.assigneeIds.includes(m.id)
                      );

                      return (
                        <TableRow
                          key={task.id}
                          className={cn(isOverdue && "bg-red-50/50")}
                        >
                          <TableCell>
                            <div className="font-medium">{task.title}</div>
                            {isOverdue && (
                              <div className="text-xs text-red-600 font-medium mt-1">
                                {daysOverdue}{" "}
                                {daysOverdue === 1 ? "día" : "días"} de retraso
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "p-1.5 rounded",
                                  config.bgColor,
                                  config.color
                                )}
                              >
                                {config.icon}
                              </div>
                              <span className="text-sm">{task.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {assignees?.map((member) => (
                                <Avatar
                                  key={member.id}
                                  className="h-8 w-8 border-2 border-background text-white"
                                  style={{
                                    backgroundColor: member.avatar.color,
                                  }}
                                >
                                  <AvatarFallback className="bg-transparent text-xs">
                                    <MemberIcon
                                      member={member}
                                      className="h-4 w-4"
                                    />
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(task.date, "d MMM yyyy", { locale: es })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(task.date, "HH:mm", { locale: es })}h
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.completed ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completada
                              </Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Caducada
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Pendiente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!task.archived ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant={
                                      task.completed ? "outline" : "default"
                                    }
                                    onClick={() =>
                                      handleToggleComplete(
                                        task.id,
                                        !task.completed
                                      )
                                    }
                                  >
                                    {task.completed ? (
                                      <>
                                        <Circle className="h-3 w-3 mr-1" />
                                        Marcar Pendiente
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Completar
                                      </>
                                    )}
                                  </Button>
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
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnarchive(task.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Desarchivar"
                                >
                                  <ArchiveRestore className="h-4 w-4 mr-1" />
                                  Desarchivar
                                </Button>
                              )}
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Progress - Right sidebar */}
        <Card className="border-0 shadow-sm lg:sticky lg:top-4 lg:h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Progreso del Equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              {tasksByMember.map(
                ({ member, total, completed, overdue, progress }) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-8 w-8 text-white"
                        style={{ backgroundColor: member.avatar.color }}
                      >
                        <AvatarFallback className="bg-transparent">
                          <MemberIcon member={member} className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {completed}/{total} completadas
                        </p>
                      </div>
                      {overdue > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 text-xs px-1.5"
                        >
                          {overdue}
                        </Badge>
                      )}
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
