"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Megaphone,
  Ticket,
  PlusCircle,
  Theater,
  Users,
  Music,
  Edit,
  Trash2,
  Instagram,
  BookOpen,
  Film,
  Camera,
  BookCopy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { CustomCalendarGrid } from "@/components/dashboard/calendar/custom-calendar-grid";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subDays,
  setHours,
  setMinutes,
  parse,
  differenceInDays,
  addDays,
} from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/dashboard/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import type { TeamMember, CalendarEvent } from "@/lib/types";
import {
  useFirestore,
  errorEmitter,
  FirestorePermissionError,
  useMemoFirebase,
  useCollection,
} from "@/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useTeamUser } from "@/context/team-user-context";

type EventType =
  | "Publicaciones en redes"
  | "Venta de entradas"
  | "Espectáculos"
  | "Reunión de Equipo"
  | "Reunión Externa"
  | "Ensayos"
  | "Tarea de laSala";

const eventConfig: Record<
  EventType,
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

function AddEditEventSheet({
  open,
  onOpenChange,
  event,
  onSave,
  onDelete,
  teamMembers,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent;
  onSave: (event: Omit<CalendarEvent, "id"> | CalendarEvent) => void;
  onDelete: (id: string) => void;
  teamMembers: TeamMember[];
  initialData?: Partial<CalendarEvent>;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [type, setType] = useState<EventType | undefined>();
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const data = event || initialData;
      setTitle(data?.title || "");
      const eventDate = data?.date
        ? data.date instanceof Timestamp
          ? data.date.toDate()
          : data.date
        : undefined;
      setDate(eventDate);
      setTime(eventDate ? format(eventDate, "HH:mm") : "");
      setType(data?.type);
      setAssigneeIds(data?.assigneeIds || []);
      setCompleted(data?.completed || false);
    }
  }, [open, event, initialData]);

  const handleSave = () => {
    if (title && date && type && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDate = setMinutes(setHours(date, hours), minutes);

      const eventData = {
        title,
        date: combinedDate,
        type,
        assigneeIds,
        completed,
      };

      if (event?.id) {
        onSave({ ...eventData, id: event.id });
      } else {
        onSave(eventData);
      }
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      onOpenChange(false);
    }
  };

  const toggleAssignee = (id: string) => {
    setAssigneeIds((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id]
    );
  };

  const selectedMembers = useMemo(
    () => teamMembers.filter((m) => assigneeIds.includes(m.id)),
    [assigneeIds, teamMembers]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {event ? "Editar Evento" : "Añadir Nuevo Evento"}
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título del Evento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
                {Object.keys(eventConfig).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Responsables</Label>
            <Popover
              open={isAssigneePopoverOpen}
              onOpenChange={setIsAssigneePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isAssigneePopoverOpen}
                  className="w-full justify-between h-auto"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedMembers.length > 0
                      ? selectedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 p-1 rounded-md"
                            style={{
                              backgroundColor: `${member.avatar.color}30`,
                            }}
                          >
                            <Avatar
                              className="h-5 w-5 text-white"
                              style={{ backgroundColor: member.avatar.color }}
                            >
                              <AvatarFallback className="bg-transparent text-xs">
                                <MemberIcon
                                  member={member}
                                  className="h-3 w-3"
                                />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{member.name}</span>
                          </div>
                        ))
                      : "Seleccionar responsables..."}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar miembro..." />
                  <CommandList>
                    <CommandEmpty>
                      No se encontró ningún miembro del equipo.
                    </CommandEmpty>
                    <CommandGroup>
                      {teamMembers.map((member) => (
                        <CommandItem
                          key={member.id}
                          onSelect={() => toggleAssignee(member.id)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox checked={assigneeIds.includes(member.id)} />
                          <Avatar
                            className="h-6 w-6 text-white"
                            style={{ backgroundColor: member.avatar.color }}
                          >
                            <AvatarFallback className="bg-transparent text-sm">
                              <MemberIcon member={member} className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {assigneeIds.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <Checkbox
                id="completed"
                checked={completed}
                onCheckedChange={(checked) => setCompleted(!!checked)}
              />
              <Label htmlFor="completed" className="cursor-pointer">
                Marcar como tarea completada
              </Label>
            </div>
          )}
        </div>
        <SheetFooter>
          <div className="flex justify-between items-center w-full gap-2">
            {event ? (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar Evento</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ScheduleInstagramSheet({
  open,
  onOpenChange,
  shows,
  teamMembers,
  onSchedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shows: CalendarEvent[];
  teamMembers: TeamMember[];
  onSchedule: (newEvents: Omit<CalendarEvent, "id">[]) => void;
}) {
  const [selectedShowId, setSelectedShowId] = useState<string | undefined>();

  const [useStory, setUseStory] = useState(false);
  const [storyCount, setStoryCount] = useState(1);

  const [usePost, setUsePost] = useState(false);
  const [postCount, setPostCount] = useState(1);

  const [useReel, setUseReel] = useState(false);
  const [reelCount, setReelCount] = useState(1);

  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);

  const selectedShow = shows.find((s) => s.id === selectedShowId);

  const generatedDates = useMemo(() => {
    if (!selectedShow) return [];
    const showDate =
      selectedShow.date instanceof Timestamp
        ? selectedShow.date.toDate()
        : selectedShow.date;
    const today = new Date();
    const daysBetween = differenceInDays(showDate, today);

    if (daysBetween <= 0) return [];

    const schedule = [];
    let totalPosts = 0;

    if (useReel) totalPosts += reelCount;
    if (usePost) totalPosts += postCount;
    if (useStory) totalPosts += storyCount;
    if (totalPosts === 0) return [];

    const interval = daysBetween / (totalPosts + 1);

    let postCounter = 1;

    if (useReel) {
      for (let i = 0; i < reelCount; i++) {
        const date = addDays(today, Math.round(postCounter * interval));
        schedule.push({
          type: "Reel",
          date,
          text: `Publicación ${i + 1}: ${format(date, "d MMM, yyyy", {
            locale: es,
          })}`,
        });
        postCounter++;
      }
    }
    if (usePost) {
      for (let i = 0; i < postCount; i++) {
        const date = addDays(today, Math.round(postCounter * interval));
        schedule.push({
          type: "Publicación",
          date,
          text: `Publicación ${i + 1}: ${format(date, "d MMM, yyyy", {
            locale: es,
          })}`,
        });
        postCounter++;
      }
    }
    if (useStory) {
      for (let i = 0; i < storyCount; i++) {
        const date = addDays(today, Math.round(postCounter * interval));
        schedule.push({
          type: "Story",
          date,
          text: `Publicación ${i + 1}: ${format(date, "d MMM, yyyy", {
            locale: es,
          })}`,
        });
        postCounter++;
      }
    }
    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [
    selectedShow,
    useStory,
    storyCount,
    usePost,
    postCount,
    useReel,
    reelCount,
  ]);

  const toggleAssignee = (id: string) => {
    setAssigneeIds((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id]
    );
  };

  const selectedMembers = useMemo(
    () => teamMembers.filter((m) => assigneeIds.includes(m.id)),
    [assigneeIds, teamMembers]
  );

  const handleSchedule = () => {
    if (!selectedShow || generatedDates.length === 0) return;

    const newEvents = generatedDates.map((item, index) => ({
      title: `${item.type} para "${selectedShow.title}" (${index + 1}/${
        generatedDates.length
      })`,
      date: item.date,
      type: "Publicaciones en redes" as EventType,
      assigneeIds: assigneeIds,
    }));

    onSchedule(newEvents);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Programar Contenido de Instagram</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Espectáculo</Label>
            <Select value={selectedShowId} onValueChange={setSelectedShowId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un espectáculo" />
              </SelectTrigger>
              <SelectContent>
                {shows.map((show) => (
                  <SelectItem key={show.id} value={show.id}>
                    {show.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Responsables</Label>
            <Popover
              open={isAssigneePopoverOpen}
              onOpenChange={setIsAssigneePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isAssigneePopoverOpen}
                  className="w-full justify-between h-auto"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedMembers.length > 0
                      ? selectedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 p-1 rounded-md"
                            style={{
                              backgroundColor: `${member.avatar.color}30`,
                            }}
                          >
                            <Avatar
                              className="h-5 w-5 text-white"
                              style={{ backgroundColor: member.avatar.color }}
                            >
                              <AvatarFallback className="bg-transparent text-xs">
                                <MemberIcon
                                  member={member}
                                  className="h-3 w-3"
                                />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{member.name}</span>
                          </div>
                        ))
                      : "Seleccionar responsables..."}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar miembro..." />
                  <CommandList>
                    <CommandEmpty>
                      No se encontró ningún miembro del equipo.
                    </CommandEmpty>
                    <CommandGroup>
                      {teamMembers.map((member) => (
                        <CommandItem
                          key={member.id}
                          onSelect={() => toggleAssignee(member.id)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox checked={assigneeIds.includes(member.id)} />
                          <Avatar
                            className="h-6 w-6 text-white"
                            style={{ backgroundColor: member.avatar.color }}
                          >
                            <AvatarFallback className="bg-transparent text-sm">
                              <MemberIcon member={member} className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <div className="flex items-center gap-4">
              <Checkbox
                id="story"
                checked={useStory}
                onCheckedChange={(c) => setUseStory(!!c)}
              />
              <Label
                htmlFor="story"
                className="flex items-center gap-2 font-semibold"
              >
                <BookOpen className="h-4 w-4" /> Story
              </Label>
              {useStory && (
                <Select
                  value={String(storyCount)}
                  onValueChange={(v) => setStoryCount(Number(v))}
                >
                  <SelectTrigger className="w-20 ml-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {generatedDates
              .filter((d) => d.type === "Story")
              .map((d, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-8">
                  {d.text}
                </p>
              ))}

            <div className="flex items-center gap-4">
              <Checkbox
                id="post"
                checked={usePost}
                onCheckedChange={(c) => setUsePost(!!c)}
              />
              <Label
                htmlFor="post"
                className="flex items-center gap-2 font-semibold"
              >
                <Camera className="h-4 w-4" /> Publicación
              </Label>
              {usePost && (
                <Select
                  value={String(postCount)}
                  onValueChange={(v) => setPostCount(Number(v))}
                >
                  <SelectTrigger className="w-20 ml-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {generatedDates
              .filter((d) => d.type === "Publicación")
              .map((d, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-8">
                  {d.text}
                </p>
              ))}

            <div className="flex items-center gap-4">
              <Checkbox
                id="reel"
                checked={useReel}
                onCheckedChange={(c) => setUseReel(!!c)}
              />
              <Label
                htmlFor="reel"
                className="flex items-center gap-2 font-semibold"
              >
                <Film className="h-4 w-4" /> Reel
              </Label>
              {useReel && (
                <Select
                  value={String(reelCount)}
                  onValueChange={(v) => setReelCount(Number(v))}
                >
                  <SelectTrigger className="w-20 ml-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {generatedDates
              .filter((d) => d.type === "Reel")
              .map((d, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-8">
                  {d.text}
                </p>
              ))}
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedShow || generatedDates.length === 0}
          >
            Programar Publicaciones
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EventItem({
  event,
  onEditClick,
  teamMembers,
}: {
  event: CalendarEvent;
  onEditClick: (event: CalendarEvent) => void;
  teamMembers: TeamMember[];
}) {
  const config = eventConfig[event.type];
  const eventDate =
    event.date instanceof Timestamp ? event.date.toDate() : event.date;
  const assignedMembers = useMemo(
    () => teamMembers.filter((m) => event.assigneeIds?.includes(m.id)),
    [event.assigneeIds, teamMembers]
  );

  return (
    <button
      onClick={() => onEditClick(event)}
      className="flex w-full items-center gap-3 text-left p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
          config.bgColor,
          config.color
        )}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(eventDate, "HH:mm", { locale: es })}h
          </p>
        </div>
        {assignedMembers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-1.5 px-1.5 py-0.5 text-xs rounded-md"
                style={{ backgroundColor: `${member.avatar.color}20` }}
              >
                <Avatar
                  className="h-4 w-4 text-white flex-shrink-0"
                  style={{ backgroundColor: member.avatar.color }}
                >
                  <AvatarFallback className="bg-transparent text-[8px]">
                    <MemberIcon member={member} className="h-2 w-2" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{member.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function WeekAgendaView({
  events,
  teamMembers,
  onEditEvent,
  currentDate,
  onNavigateWeek,
}: {
  events: CalendarEvent[];
  teamMembers: TeamMember[];
  onEditEvent: (event: CalendarEvent) => void;
  currentDate: Date;
  onNavigateWeek: (direction: "prev" | "next") => void;
}) {
  const startOfCurrentWeek = startOfWeek(currentDate, {
    locale: es,
    weekStartsOn: 1,
  });

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfCurrentWeek, i)
  );

  const getEventsForDay = (day: Date) => {
    return events
      .filter((event) => {
        const eventDate =
          event.date instanceof Timestamp ? event.date.toDate() : event.date;
        return isSameDay(eventDate, day);
      })
      .sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : a.date;
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : b.date;
        return dateA.getTime() - dateB.getTime();
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Agenda Semanal - {format(startOfCurrentWeek, "d MMM", { locale: es })}{" "}
          -{" "}
          {format(addDays(startOfCurrentWeek, 6), "d MMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1 overflow-hidden">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className="flex flex-col border rounded-lg overflow-hidden bg-card"
            >
              <div
                className={cn(
                  "p-2 text-center border-b font-semibold text-sm",
                  isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <div>{format(day, "EEEE", { locale: es })}</div>
                <div className="text-lg">
                  {format(day, "d", { locale: es })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => {
                    const config = eventConfig[event.type];
                    const eventDate =
                      event.date instanceof Timestamp
                        ? event.date.toDate()
                        : event.date;
                    const assignedMembers = teamMembers.filter((m) =>
                      event.assigneeIds?.includes(m.id)
                    );

                    return (
                      <button
                        key={event.id}
                        onClick={() => onEditEvent(event)}
                        className={cn(
                          "w-full text-left p-2 rounded-md text-xs hover:opacity-80 transition-opacity",
                          config.bgColor,
                          config.color
                        )}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {config.icon}
                          <span className="font-semibold">
                            {format(eventDate, "HH:mm", { locale: es })}
                          </span>
                        </div>
                        <div className="font-medium mb-1">{event.title}</div>
                        {assignedMembers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {assignedMembers.map((member) => (
                              <Avatar
                                key={member.id}
                                className="h-4 w-4 text-white"
                                style={{ backgroundColor: member.avatar.color }}
                              >
                                <AvatarFallback className="bg-transparent text-[8px]">
                                  <MemberIcon
                                    member={member}
                                    className="h-2 w-2"
                                  />
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Sin eventos
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayEventsDialog({
  date,
  events,
  teamMembers,
  open,
  onOpenChange,
  onEditEvent,
}: {
  date: Date;
  events: CalendarEvent[];
  teamMembers: TeamMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEvent: (event: CalendarEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Eventos para el {format(date, "d MMMM, yyyy", { locale: es })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {events.length > 0 ? (
            events.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onEditClick={onEditEvent}
                teamMembers={teamMembers}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay eventos para este día.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalendarPageContent() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState<Date | null>(null);

  const [isAddEditSheetOpen, setIsAddEditSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined
  );
  const [addEventInitialData, setAddEventInitialData] = useState<
    Partial<CalendarEvent> | undefined
  >();

  const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);

  const [filteredAssigneeIds, setFilteredAssigneeIds] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<"calendar" | "agenda">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("calendar-view-mode");
      return saved === "agenda" || saved === "calendar" ? saved : "calendar";
    }
    return "calendar";
  });

  const [dayDialogDate, setDayDialogDate] = useState<Date | null>(null);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);

  // Guardar viewMode en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("calendar-view-mode", viewMode);
    }
  }, [viewMode]);

  const db = useFirestore();
  const { toast } = useToast();
  const { selectedTeamUser } = useTeamUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set the default filter to the currently selected team user
    if (selectedTeamUser) {
      setFilteredAssigneeIds([selectedTeamUser.id]);
    }
  }, [selectedTeamUser]);

  useEffect(() => {
    const showTitle = searchParams.get("scheduleShow");
    if (showTitle) {
      setAddEventInitialData({
        title: decodeURIComponent(showTitle),
        type: "Espectáculos",
      });
      openSheetForNew();
    }
  }, [searchParams]);

  const teamMembersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "teamMembers");
  }, [db]);
  const { data: fetchedMembers } = useCollection<TeamMember>(teamMembersQuery);

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "events");
  }, [db]);
  const { data: fetchedEvents, isLoading: isLoadingEvents } =
    useCollection<CalendarEvent>(eventsQuery);

  useEffect(() => {
    if (fetchedMembers) setTeamMembers(fetchedMembers);
  }, [fetchedMembers]);

  useEffect(() => {
    if (fetchedEvents) {
      const processedEvents = fetchedEvents
        .map((event) => ({
          ...event,
          date:
            event.date instanceof Timestamp
              ? event.date.toDate()
              : new Date(event.date),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      setEvents(processedEvents);
    }
  }, [fetchedEvents]);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const handleDayClick = (day: Date) => {
    setDayDialogDate(day);
    setIsDayDialogOpen(true);
  };

  const handleEditEventFromDialog = (event: CalendarEvent) => {
    setIsDayDialogOpen(false);
    // Allow time for dialog to close before opening sheet
    setTimeout(() => {
      openSheetForEdit(event);
    }, 150);
  };

  const openSheetForEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setAddEventInitialData(undefined);
    setIsAddEditSheetOpen(true);
  };

  const openSheetForNew = () => {
    setSelectedEvent(undefined);
    setIsAddEditSheetOpen(true);
  };

  const handleSaveEvent = (
    eventData: Omit<CalendarEvent, "id"> | CalendarEvent
  ) => {
    if (!db) return;

    const isNew = !("id" in eventData);
    const docRef = isNew
      ? doc(collection(db, "events"))
      : doc(db, "events", eventData.id);
    const { id, ...dataToSave } = eventData as CalendarEvent;

    const dataWithTimestamp = {
      ...dataToSave,
      date: Timestamp.fromDate(dataToSave.date),
    };

    setDoc(docRef, dataWithTimestamp, { merge: !isNew })
      .then(() =>
        toast({
          title: isNew ? "Evento añadido" : "Evento actualizado",
          description: `${dataToSave.title} ha sido ${
            isNew ? "añadido" : "actualizado"
          }.`,
        })
      )
      .catch((err) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: docRef.path,
            operation: isNew ? "create" : "update",
            requestResourceData: dataWithTimestamp,
          })
        );
      });
  };

  const handleDeleteEvent = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "events", id);
    deleteDoc(docRef)
      .then(() =>
        toast({
          title: "Evento eliminado",
          description: "El evento ha sido eliminado.",
        })
      )
      .catch((err) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: docRef.path,
            operation: "delete",
          })
        );
      });
  };

  const handleScheduleInstagram = (newEvents: Omit<CalendarEvent, "id">[]) => {
    if (!db || newEvents.length === 0) return;

    const batch = writeBatch(db);
    newEvents.forEach((eventData) => {
      const newDocRef = doc(collection(db, "events"));
      const dateToSave =
        eventData.date instanceof Date
          ? Timestamp.fromDate(eventData.date)
          : eventData.date;
      batch.set(newDocRef, { ...eventData, date: dateToSave });
    });

    batch
      .commit()
      .then(() =>
        toast({
          title: "Publicaciones programadas",
          description: `Se han añadido ${newEvents.length} nuevos eventos al calendario.`,
        })
      )
      .catch((err) => {
        const sampleEventForError = newEvents[0];
        const permissionError = new FirestorePermissionError({
          path: "events/<auto-id>",
          operation: "create",
          requestResourceData: {
            ...sampleEventForError,
            date: (sampleEventForError.date as Date).toISOString(),
          },
        });
        errorEmitter.emit("permission-error", permissionError);
      });
  };

  const toggleFilterAssignee = (id: string) => {
    setFilteredAssigneeIds((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id]
    );
  };

  const handleNavigateWeek = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const weeks = direction === "prev" ? -7 : 7;
      return addDays(prev, weeks);
    });
  };

  const filteredEvents = useMemo(() => {
    if (filteredAssigneeIds.length === 0) {
      return events;
    }
    return events.filter(
      (event) =>
        event.assigneeIds &&
        event.assigneeIds.some((id) => filteredAssigneeIds.includes(id))
    );
  }, [events, filteredAssigneeIds]);

  const dayDialogEvents = useMemo(() => {
    if (!dayDialogDate) return [];
    return filteredEvents.filter((e) => {
      const eventDate = e.date instanceof Timestamp ? e.date.toDate() : e.date;
      return isSameDay(eventDate, dayDialogDate);
    });
  }, [dayDialogDate, filteredEvents]);

  if (!today) {
    return null; // or a loading skeleton
  }

  const startOfCurrentWeek = startOfWeek(today, { locale: es });
  const endOfCurrentWeek = endOfWeek(today, { locale: es });
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const eventsToday = filteredEvents.filter((e) => {
    const eventDate = e.date instanceof Timestamp ? e.date.toDate() : e.date;
    return isSameDay(eventDate, today);
  });
  const eventsWeek = filteredEvents.filter((e) => {
    const eventDate = e.date instanceof Timestamp ? e.date.toDate() : e.date;
    return eventDate >= startOfCurrentWeek && eventDate <= endOfCurrentWeek;
  });
  const eventsMonth = filteredEvents.filter((e) => {
    const eventDate = e.date instanceof Timestamp ? e.date.toDate() : e.date;
    return eventDate >= startOfCurrentMonth && eventDate <= endOfCurrentMonth;
  });
  const futureShows = events.filter((e) => {
    const eventDate = e.date instanceof Timestamp ? e.date.toDate() : e.date;
    return e.type === "Espectáculos" && eventDate > new Date();
  });

  return (
    <>
      <div className="flex h-[calc(100vh-120px)] px-6 md:px-8 py-6">
        {/* Sidebar */}
        <aside className="w-64 pr-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
              Acciones
            </h3>

            <Button
              className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-soft hover:shadow-md transition-all"
              onClick={() => {
                setAddEventInitialData(undefined);
                openSheetForNew();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Evento
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-white/60 backdrop-blur-sm shadow-soft hover:shadow-md transition-all border-white/60"
              onClick={() => setIsScheduleSheetOpen(true)}
            >
              <Instagram className="mr-2 h-4 w-4" />
              Programar Instagram
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
              Vistas
            </h3>

            <div className="flex bg-white/60 backdrop-blur-sm rounded-lg shadow-soft p-1 border border-white/60">
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "flex-1 flex items-center justify-center py-2.5 px-3 rounded-md transition-all",
                  viewMode === "calendar"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={cn(
                  "flex-1 flex items-center justify-center py-2.5 px-3 rounded-md transition-all",
                  viewMode === "agenda"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookCopy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
              Filtros
            </h3>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start bg-white/60 backdrop-blur-sm shadow-soft hover:shadow-md transition-all border-white/60",
                    filteredAssigneeIds.length > 0 && "bg-secondary/60"
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Responsables
                  {filteredAssigneeIds.length > 0 && (
                    <span className="ml-auto h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {filteredAssigneeIds.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-64" side="right">
                <Command>
                  <CommandInput placeholder="Buscar miembro..." />
                  <CommandList>
                    <CommandEmpty>No se encontró ningún miembro.</CommandEmpty>
                    <CommandGroup>
                      {teamMembers.map((member) => (
                        <CommandItem
                          key={member.id}
                          onSelect={() => toggleFilterAssignee(member.id)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={filteredAssigneeIds.includes(member.id)}
                          />
                          <Avatar
                            className="h-6 w-6 text-white"
                            style={{ backgroundColor: member.avatar.color }}
                          >
                            <AvatarFallback className="bg-transparent text-sm">
                              <MemberIcon member={member} className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          {viewMode === "calendar" ? (
            <CustomCalendarGrid
              currentMonth={currentMonth}
              filteredEvents={filteredEvents}
              teamMembers={teamMembers}
              eventConfig={eventConfig}
              today={today}
              onDayClick={handleDayClick}
              onEventClick={openSheetForEdit}
            />
          ) : (
            <WeekAgendaView
              events={filteredEvents}
              teamMembers={teamMembers}
              onEditEvent={openSheetForEdit}
              currentDate={currentMonth}
              onNavigateWeek={handleNavigateWeek}
            />
          )}
        </main>
      </div>

      <AddEditEventSheet
        open={isAddEditSheetOpen}
        onOpenChange={setIsAddEditSheetOpen}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        teamMembers={teamMembers}
        initialData={addEventInitialData}
      />
      <ScheduleInstagramSheet
        open={isScheduleSheetOpen}
        onOpenChange={setIsScheduleSheetOpen}
        shows={futureShows}
        teamMembers={teamMembers}
        onSchedule={handleScheduleInstagram}
      />
      {dayDialogDate && (
        <DayEventsDialog
          date={dayDialogDate}
          events={dayDialogEvents}
          teamMembers={teamMembers}
          open={isDayDialogOpen}
          onOpenChange={setIsDayDialogOpen}
          onEditEvent={handleEditEventFromDialog}
        />
      )}
    </>
  );
}

export default function CalendarPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CalendarPageContent />
    </React.Suspense>
  );
}
