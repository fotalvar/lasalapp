"use client";

import { useState, useEffect, useMemo } from "react";
import type { CalendarEvent, TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bot, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { assignTask } from "@/ai/flows/assign-task";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from "@/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Calendar as CalendarIcon,
  Theater,
  Megaphone,
  Ticket,
  Users,
  Music,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, setHours, setMinutes, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";
import { Progress } from "@/components/ui/progress";

type EventType =
  | "Publicaciones en redes"
  | "Venta de entradas"
  | "Espectáculos"
  | "Reunión de Equipo"
  | "Reunión Externa"
  | "Ensayos"
  | "Tarea de laSala";

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

function AddTaskSheet({
  teamMembers,
  onAdd,
}: {
  teamMembers: TeamMember[];
  onAdd: (newEvent: Omit<CalendarEvent, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("09:00");
  const [type, setType] = useState<EventType>("Reunión de Equipo");
  const [suggestion, setSuggestion] = useState<{
    member: string;
    reason: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    if (!task) {
      toast({
        title: "Error",
        description: "Por favor, introduce una descripción de la tarea.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestion(null);
    try {
      const teamMembersForAI = teamMembers.map((m) => ({
        name: m.name,
        currentTasks: m.currentTasks || [],
        upcomingDeadlines: m.upcomingDeadlines || [],
      }));
      const result = await assignTask({
        task,
        teamMembers: teamMembersForAI,
      });
      setSuggestion({
        member: result.suggestedTeamMember,
        reason: result.reasoning,
      });
      const suggestedMember = teamMembers.find(
        (m) => m.name === result.suggestedTeamMember
      );
      if (suggestedMember) setSelectedAssigneeId(suggestedMember.id);
    } catch (error) {
      console.error(error);
      toast({
        title: "Sugerencia de IA fallida",
        description:
          "No se pudo obtener una sugerencia de la IA. Por favor, asigna manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!task || !selectedAssigneeId || !date || !time) {
      toast({
        title: "Información Faltante",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }
    const [hours, minutes] = time.split(":").map(Number);
    const combinedDate = setMinutes(setHours(date, hours), minutes);

    const newEvent: Omit<CalendarEvent, "id"> = {
      title: task,
      date: combinedDate,
      type,
      assigneeIds: [selectedAssigneeId],
      completed: false,
    };
    onAdd(newEvent);
    setOpen(false);
    setTask("");
    setDate(new Date());
    setTime("09:00");
    setType("Reunión de Equipo");
    setSuggestion(null);
    setSelectedAssigneeId(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Tarea
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Añadir Nueva Tarea</SheetTitle>
          <SheetDescription>
            Describe la nueva tarea y obtén una sugerencia de IA para el mejor
            asignado.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task">Tarea</Label>
            <Input
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="p. ej., 'Organizar el festival de verano'"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleGetSuggestion}
            disabled={isLoading}
          >
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? "Analizando..." : "Obtener Sugerencia de IA"}
          </Button>
          {isLoading && <Skeleton className="h-16 w-full" />}
          {suggestion && (
            <div className="p-3 bg-secondary/50 rounded-lg border">
              <h4 className="font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4" /> Sugerencia de IA
              </h4>
              <p className="text-sm mt-1">
                Asignar a <strong>{suggestion.member}</strong>.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Razonamiento:</strong> {suggestion.reason}
              </p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="assignee">Asignado</Label>
            <Select
              value={selectedAssigneeId || undefined}
              onValueChange={(value) => {
                setSelectedAssigneeId(value);
              }}
            >
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Seleccionar un asignado" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "P", { locale: es })
                    ) : (
                      <span>Elige una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Categoría</Label>
            <Select value={type} onValueChange={(v: EventType) => setType(v)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reunión de Equipo">
                  Reunión de Equipo
                </SelectItem>
                <SelectItem value="Reunión Externa">Reunión Externa</SelectItem>
                <SelectItem value="Ensayos">Ensayos</SelectItem>
                <SelectItem value="Espectáculos">Espectáculos</SelectItem>
                <SelectItem value="Tarea de laSala">Tarea de laSala</SelectItem>
                <SelectItem value="Publicaciones en redes">
                  Publicaciones en redes
                </SelectItem>
                <SelectItem value="Venta de entradas">
                  Venta de entradas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddTask}>Añadir Tarea</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function TasksClient() {
  const db = useFirestore();
  const { toast } = useToast();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const teamMembersQuery = useMemoFirebase(
    () => (db ? collection(db, "teamMembers") : null),
    [db]
  );
  const { data: fetchedMembers } = useCollection<TeamMember>(teamMembersQuery);

  const eventsQuery = useMemoFirebase(
    () => (db ? collection(db, "events") : null),
    [db]
  );
  const { data: fetchedEvents } = useCollection<CalendarEvent>(eventsQuery);

  useEffect(() => {
    if (fetchedMembers) {
      setTeamMembers(fetchedMembers);
    }
  }, [fetchedMembers]);

  useEffect(() => {
    if (fetchedEvents) {
      // Filtrar solo eventos que tengan assigneeIds (son tareas)
      const tasks = fetchedEvents
        .filter((event) => event.assigneeIds && event.assigneeIds.length > 0)
        .map((event) => ({
          ...event,
          date:
            event.date instanceof Timestamp ? event.date.toDate() : event.date,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      setEvents(tasks);
    }
  }, [fetchedEvents]);

  const handleAddTask = (newEventData: Omit<CalendarEvent, "id">) => {
    if (!db) return;
    addDoc(collection(db, "events"), newEventData)
      .then(() =>
        toast({
          title: "Tarea añadida",
          description: `${newEventData.title} ha sido añadida.`,
        })
      )
      .catch((err) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: "events",
            operation: "create",
            requestResourceData: newEventData,
          })
        );
      });
  };

  const handleUpdate = (updatedEvent: CalendarEvent) => {
    if (!db) return;
    const { id, ...eventData } = updatedEvent;
    const eventRef = doc(db, "events", id);
    setDoc(eventRef, eventData, { merge: true }).catch((err) => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: eventRef.path,
          operation: "update",
          requestResourceData: eventData,
        })
      );
    });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const eventRef = doc(db, "events", id);
    deleteDoc(eventRef)
      .then(() => toast({ title: "Tarea eliminada" }))
      .catch((err) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: eventRef.path,
            operation: "delete",
          })
        );
      });
  };

  // Agrupar tareas por persona
  const tasksByMember = useMemo(() => {
    return teamMembers.map((member) => {
      const memberTasks = events.filter(
        (event) => event.assigneeIds && event.assigneeIds.includes(member.id)
      );
      const completedTasks = memberTasks.filter((task) => task.completed);
      const progress =
        memberTasks.length > 0
          ? (completedTasks.length / memberTasks.length) * 100
          : 0;

      return {
        member,
        tasks: memberTasks,
        completedCount: completedTasks.length,
        totalCount: memberTasks.length,
        progress,
      };
    });
  }, [teamMembers, events]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddTaskSheet teamMembers={teamMembers} onAdd={handleAddTask} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {tasksByMember.map(
          ({ member, tasks, completedCount, totalCount, progress }) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar
                    className="h-10 w-10 text-white"
                    style={{ backgroundColor: member.avatar.color }}
                  >
                    <AvatarFallback className="bg-transparent">
                      <MemberIcon member={member} className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {completedCount} de {totalCount} tareas completadas
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de tareas */}
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay tareas asignadas
                    </p>
                  ) : (
                    tasks.map((task) => {
                      const config = eventConfig[task.type];
                      const now = new Date();
                      const taskDate =
                        task.date instanceof Date
                          ? task.date
                          : new Date(task.date);
                      const isOverdue = !task.completed && taskDate < now;
                      const daysOverdue = isOverdue
                        ? differenceInDays(now, taskDate)
                        : 0;

                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                            task.completed && "bg-muted/30",
                            isOverdue && "bg-red-50 border-red-200"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                              isOverdue
                                ? "bg-red-100 text-red-600"
                                : `${config.bgColor} ${config.color}`
                            )}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                task.completed &&
                                  "line-through text-muted-foreground",
                                isOverdue && "text-red-700"
                              )}
                            >
                              {task.title}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                isOverdue
                                  ? "text-red-600 font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {isOverdue ? (
                                <>
                                  Tarea Pendiente · {daysOverdue}{" "}
                                  {daysOverdue === 1 ? "día" : "días"} de
                                  retraso
                                </>
                              ) : (
                                <>
                                  {format(taskDate, "d MMM, HH:mm", {
                                    locale: es,
                                  })}
                                  h
                                </>
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={
                              task.completed
                                ? "outline"
                                : isOverdue
                                ? "destructive"
                                : "default"
                            }
                            onClick={() =>
                              handleUpdate({
                                ...task,
                                completed: !task.completed,
                              })
                            }
                            className="flex-shrink-0"
                          >
                            {task.completed ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Completada
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4 mr-1" />
                                Marcar Completa
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Barra de progreso */}
                {totalCount > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
