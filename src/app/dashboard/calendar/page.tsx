
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Megaphone,
  Ticket,
  PlusCircle,
  Clapperboard,
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
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { add, endOfMonth, endOfWeek, isSameDay, startOfMonth, startOfWeek, subDays } from 'date-fns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/dashboard/page-header';
import { Checkbox } from '@/components/ui/checkbox';
import type { TeamMember } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

type EventType =
  | 'Publicaciones en redes'
  | 'Venta de entradas'
  | 'Espectáculos'
  | 'Reuniones'
  | 'Ensayos';

type Event = {
  id: string;
  date: Date;
  title: string;
  type: EventType;
  assigneeIds?: string[];
};

const initialEvents: Event[] = [
  {
    id: '1',
    date: add(new Date(), { days: 12 }),
    title: 'Estreno de "Eco"',
    type: 'Espectáculos',
    assigneeIds: ['1', '3'],
  },
  {
    id: '2',
    date: add(new Date(), { days: 5 }),
    title: 'Post en Instagram para "Laberint"',
    type: 'Publicaciones en redes',
    assigneeIds: ['4'],
  },
  {
    id: '3',
    date: add(new Date(), { days: 8 }),
    title: 'Venta anticipada de entradas',
    type: 'Venta de entradas',
  },
  {
    id: '4',
    date: add(new Date(), { days: 1 }),
    title: 'Ensayo general "Eco"',
    type: 'Ensayos',
    assigneeIds: ['2'],
  },
  {
    id: '5',
    date: add(new Date(), { days: 1 }),
    title: 'Reunión de producción',
    type: 'Reuniones',
     assigneeIds: ['1', '2', '3', '4'],
  },
   {
    id: '6',
    date: add(new Date(), { days: 25 }),
    title: 'Concierto Acústico',
    type: 'Espectáculos',
  },
];

const eventConfig: Record<
  EventType,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  'Publicaciones en redes': {
    icon: <Megaphone className="h-4 w-4" />,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
  },
  'Venta de entradas': {
    icon: <Ticket className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  'Espectáculos': {
    icon: <Clapperboard className="h-4 w-4" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
  'Reuniones': {
    icon: <Users className="h-4 w-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  'Ensayos': {
    icon: <Music className="h-4 w-4" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
};

function MemberIcon({ member, className }: { member: TeamMember, className?: string }) {
    const IconComponent = (LucideIcons as any)[member.avatar.icon] as React.ElementType;
    if (!IconComponent) return <LucideIcons.User className={cn("h-5 w-5", className)} />;
    return <IconComponent className={cn("h-5 w-5", className)} />;
}

function AddEditEventSheet({
  open,
  onOpenChange,
  event,
  onSave,
  onDelete,
  teamMembers
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  onSave: (event: Event) => void;
  onDelete: (id: string) => void;
  teamMembers: TeamMember[];
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [type, setType] = useState<EventType | undefined>();
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(event?.title || '');
      setDate(event?.date);
      setType(event?.type);
      setAssigneeIds(event?.assigneeIds || []);
    }
  }, [open, event]);


  const handleSave = () => {
    if (title && date && type) {
      onSave({
        id: event?.id || `evt-${Date.now()}`,
        title,
        date,
        type,
        assigneeIds,
      });
      onOpenChange(false);
    }
  };
  
  const handleDelete = () => {
    if(event) {
      onDelete(event.id);
      onOpenChange(false);
    }
  }

  const toggleAssignee = (id: string) => {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]);
  }
  
  const selectedMembers = useMemo(() => teamMembers.filter(m => assigneeIds.includes(m.id)), [assigneeIds, teamMembers]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{event ? 'Editar Evento' : 'Añadir Nuevo Evento'}</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título del Evento</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : <span>Elige una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
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
             <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={isAssigneePopoverOpen} className="w-full justify-between h-auto">
                    <div className='flex flex-wrap gap-1'>
                        {selectedMembers.length > 0 ? selectedMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-2 p-1 rounded-md" style={{backgroundColor: `${member.avatar.color}30`}}>
                                <Avatar className="h-5 w-5 text-white" style={{ backgroundColor: member.avatar.color }}>
                                    <AvatarFallback className="bg-transparent text-xs">
                                        <MemberIcon member={member} className="h-3 w-3" />
                                    </AvatarFallback>
                                </Avatar>
                                <span className='text-xs'>{member.name}</span>
                            </div>
                        )) : "Seleccionar responsables..."}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar miembro..." />
                    <CommandEmpty>No se encontró ningún miembro del equipo.</CommandEmpty>
                    <CommandGroup>
                        {teamMembers.map(member => (
                            <CommandItem key={member.id} onSelect={() => toggleAssignee(member.id)} className="flex items-center gap-2">
                                <Checkbox checked={assigneeIds.includes(member.id)} />
                                 <Avatar className="h-6 w-6 text-white" style={{ backgroundColor: member.avatar.color }}>
                                    <AvatarFallback className="bg-transparent text-sm">
                                        <MemberIcon member={member} className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <SheetFooter>
          <div className='flex justify-between w-full'>
            {event ? (
              <Button variant="destructive" onClick={handleDelete} className='mr-auto'>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            ) : <div></div>}
            <div className='space-x-2'>
               <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
               <Button onClick={handleSave}>Guardar Evento</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ScheduleInstagramSheet({ open, onOpenChange, shows, teamMembers, onSchedule }: { open: boolean, onOpenChange: (open: boolean) => void, shows: Event[], teamMembers: TeamMember[], onSchedule: (newEvents: Event[]) => void }) {
    const [selectedShowId, setSelectedShowId] = useState<string | undefined>();
    
    const [useStory, setUseStory] = useState(false);
    const [storyCount, setStoryCount] = useState(1);

    const [usePost, setUsePost] = useState(false);
    const [postCount, setPostCount] = useState(1);

    const [useReel, setUseReel] = useState(false);
    const [reelCount, setReelCount] = useState(1);
    
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
    const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);

    const selectedShow = shows.find(s => s.id === selectedShowId);

    const scheduleConfig = [
        { type: 'Story', enabled: useStory, count: storyCount, icon: BookOpen, timing: (date: Date, i: number) => subDays(date, 3 + i * 2) },
        { type: 'Publicación', enabled: usePost, count: postCount, icon: Camera, timing: (date: Date, i: number) => subDays(date, 7 + i * 3) },
        { type: 'Reel', enabled: useReel, count: reelCount, icon: Film, timing: (date: Date, i: number) => subDays(date, 10 + i * 5) }
    ];
    
    const toggleAssignee = (id: string) => {
        setAssigneeIds(prev => prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]);
    }
  
    const selectedMembers = useMemo(() => teamMembers.filter(m => assigneeIds.includes(m.id)), [assigneeIds, teamMembers]);

    const handleSchedule = () => {
        if (!selectedShow) return;

        const newEvents: Event[] = [];
        
        const createEventsForType = (type: string, count: number, timingFn: (date: Date, i: number) => Date, titlePrefix: string) => {
            for (let i = 0; i < count; i++) {
                newEvents.push({
                    id: `ig-${type.toLowerCase()}-${selectedShow.id}-${i}-${Date.now()}`,
                    title: `${titlePrefix} para "${selectedShow.title}" (${i + 1}/${count})`,
                    date: timingFn(selectedShow.date, i),
                    type: 'Publicaciones en redes',
                    assigneeIds: assigneeIds,
                });
            }
        }

        if (useStory) {
            createEventsForType('story', storyCount, scheduleConfig[0].timing, 'Story');
        }
        if (usePost) {
            createEventsForType('post', postCount, scheduleConfig[1].timing, 'Publicación');
        }
        if (useReel) {
            createEventsForType('reel', reelCount, scheduleConfig[2].timing, 'Reel');
        }
        
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
                            <SelectTrigger><SelectValue placeholder="Selecciona un espectáculo" /></SelectTrigger>
                            <SelectContent>
                                {shows.map(show => <SelectItem key={show.id} value={show.id}>{show.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Responsables</Label>
                        <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={isAssigneePopoverOpen} className="w-full justify-between h-auto">
                                <div className='flex flex-wrap gap-1'>
                                    {selectedMembers.length > 0 ? selectedMembers.map(member => (
                                        <div key={member.id} className="flex items-center gap-2 p-1 rounded-md" style={{backgroundColor: `${member.avatar.color}30`}}>
                                            <Avatar className="h-5 w-5 text-white" style={{ backgroundColor: member.avatar.color }}>
                                                <AvatarFallback className="bg-transparent text-xs">
                                                    <MemberIcon member={member} className="h-3 w-3" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className='text-xs'>{member.name}</span>
                                        </div>
                                    )) : "Seleccionar responsables..."}
                                </div>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar miembro..." />
                                <CommandEmpty>No se encontró ningún miembro del equipo.</CommandEmpty>
                                <CommandGroup>
                                    {teamMembers.map(member => (
                                        <CommandItem key={member.id} onSelect={() => toggleAssignee(member.id)} className="flex items-center gap-2">
                                            <Checkbox checked={assigneeIds.includes(member.id)} />
                                            <Avatar className="h-6 w-6 text-white" style={{ backgroundColor: member.avatar.color }}>
                                                <AvatarFallback className="bg-transparent text-sm">
                                                    <MemberIcon member={member} className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center gap-4">
                           <Checkbox id="story" checked={useStory} onCheckedChange={(c) => setUseStory(!!c)} />
                           <Label htmlFor="story" className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" /> Story</Label>
                            {useStory && (
                                <Select value={String(storyCount)} onValueChange={(v) => setStoryCount(Number(v))}>
                                    <SelectTrigger className="w-20 ml-auto"><SelectValue/></SelectTrigger>
                                    <SelectContent>{Array.from({length: 5}, (_, i) => <SelectItem key={i} value={String(i+1)}>{i+1}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>
                        {selectedShow && useStory && Array.from({length: storyCount}).map((_, i) => (
                             <p key={i} className="text-xs text-muted-foreground pl-8">Publicación {i+1}: {format(scheduleConfig[0].timing(selectedShow.date, i), "d MMM, yyyy", {locale: es})}</p>
                        ))}
                        
                        <div className="flex items-center gap-4">
                           <Checkbox id="post" checked={usePost} onCheckedChange={(c) => setUsePost(!!c)} />
                           <Label htmlFor="post" className="flex items-center gap-2 font-semibold"><Camera className="h-4 w-4" /> Publicación</Label>
                            {usePost && (
                                <Select value={String(postCount)} onValueChange={(v) => setPostCount(Number(v))}>
                                    <SelectTrigger className="w-20 ml-auto"><SelectValue/></SelectTrigger>
                                    <SelectContent>{Array.from({length: 5}, (_, i) => <SelectItem key={i} value={String(i+1)}>{i+1}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>
                         {selectedShow && usePost && Array.from({length: postCount}).map((_, i) => (
                             <p key={i} className="text-xs text-muted-foreground pl-8">Publicación {i+1}: {format(scheduleConfig[1].timing(selectedShow.date, i), "d MMM, yyyy", {locale: es})}</p>
                        ))}

                         <div className="flex items-center gap-4">
                           <Checkbox id="reel" checked={useReel} onCheckedChange={(c) => setUseReel(!!c)} />
                           <Label htmlFor="reel" className="flex items-center gap-2 font-semibold"><Film className="h-4 w-4" /> Reel</Label>
                            {useReel && (
                                <Select value={String(reelCount)} onValueChange={(v) => setReelCount(Number(v))}>
                                    <SelectTrigger className="w-20 ml-auto"><SelectValue/></SelectTrigger>
                                    <SelectContent>{Array.from({length: 5}, (_, i) => <SelectItem key={i} value={String(i+1)}>{i+1}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>
                        {selectedShow && useReel && Array.from({length: reelCount}).map((_, i) => (
                             <p key={i} className="text-xs text-muted-foreground pl-8">Publicación {i+1}: {format(scheduleConfig[2].timing(selectedShow.date, i), "d MMM, yyyy", {locale: es})}</p>
                        ))}
                    </div>
                 </div>
                 <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSchedule} disabled={!selectedShow}>Programar Publicaciones</Button>
                 </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function EventItem({ event, onEditClick }: { event: Event; onEditClick: (event: Event) => void; }) {
  const config = eventConfig[event.type];
  return (
      <button onClick={() => onEditClick(event)} className="flex w-full items-center gap-3 text-left p-2 rounded-lg hover:bg-muted transition-colors">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.bgColor, config.color)}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(event.date, 'd MMM, HH:mm', { locale: es })}
          </p>
        </div>
      </button>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents.sort((a,b) => a.date.getTime() - b.date.getTime()));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState<Date | null>(null);
  
  const [isAddEditSheetOpen, setIsAddEditSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  
  const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setToday(new Date());
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'teamMembers'), (snapshot) => {
        const fetchedMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
        setTeamMembers(fetchedMembers);
    });
    return () => unsub();
  }, [db]);

  const openSheetForEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsAddEditSheetOpen(true);
  }

  const openSheetForNew = () => {
    setSelectedEvent(undefined);
    setIsAddEditSheetOpen(true);
  }

  const handleSaveEvent = (event: Event) => {
    setEvents((prev) => {
      const existing = prev.find((e) => e.id === event.id);
      if (existing) {
        return prev.map((e) => (e.id === event.id ? event : e)).sort((a,b) => a.date.getTime() - b.date.getTime());
      }
      return [...prev, event].sort((a,b) => a.date.getTime() - b.date.getTime());
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }
  
  const handleScheduleInstagram = (newEvents: Event[]) => {
    setEvents(prev => [...prev, ...newEvents].sort((a,b) => a.date.getTime() - b.date.getTime()));
  }

  if (!today) {
    return null; // or a loading skeleton
  }

  const startOfCurrentWeek = startOfWeek(today, { locale: es });
  const endOfCurrentWeek = endOfWeek(today, { locale: es });
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const eventsToday = events.filter((e) => isSameDay(e.date, today));
  const eventsWeek = events.filter((e) => e.date >= startOfCurrentWeek && e.date <= endOfCurrentWeek);
  const eventsMonth = events.filter((e) => e.date >= startOfCurrentMonth && e.date <= endOfCurrentMonth);
  const futureShows = events.filter(e => e.type === 'Espectáculos' && e.date > new Date());

  return (
    <>
      <PageHeader title="Calendario y Programación">
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <BookCopy className="mr-2 h-4 w-4" />
                  Agenda
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 md:w-96">
                 <Card className="border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>Agenda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="today">
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value="today">Hoy</TabsTrigger>
                            <TabsTrigger value="week">Semana</TabsTrigger>
                            <TabsTrigger value="month">Mes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="today" className="space-y-2 mt-4">
                            {eventsToday.length > 0 ? (
                            eventsToday.map((event) => <EventItem key={event.id} event={event} onEditClick={openSheetForEdit} />)
                            ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay eventos para hoy.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="week" className="space-y-2 mt-4">
                            {eventsWeek.length > 0 ? (
                            eventsWeek.map((event) => <EventItem key={event.id} event={event} onEditClick={openSheetForEdit} />)
                            ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay eventos esta semana.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="month" className="space-y-2 mt-4">
                            {eventsMonth.length > 0 ? (
                            eventsMonth.map((event) => <EventItem key={event.id} event={event} onEditClick={openSheetForEdit} />)
                            ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay eventos este mes.</p>
                            )}
                        </TabsContent>
                        </Tabs>
                    </CardContent>
                    </Card>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={() => setIsScheduleSheetOpen(true)}>
                <Instagram className="mr-2 h-4 w-4" />
                Programar Instagram
            </Button>
            <Button size="sm" onClick={openSheetForNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Evento
            </Button>
          </div>
      </PageHeader>
      <main className="p-4 md:px-6">
        <div>
            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="p-0"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full',
                caption_label: 'text-base font-bold',
                table: 'w-full border-collapse space-y-1',
                head_row: 'grid grid-cols-7 gap-1',
                head_cell: 'text-muted-foreground font-normal text-sm text-center py-2',
                row: 'grid grid-cols-7 gap-1 mt-2',
                cell: 'h-28 text-sm text-center p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-full w-full p-1 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start hover:bg-accent transition-colors rounded-md border',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
              }}
              components={{
                DayContent: (props) => {
                  const dayEvents = events.filter((event) =>
                    isSameDay(event.date, props.date)
                  );
                  return (
                    <div className="relative h-full w-full">
                      <time dateTime={props.date.toISOString()} className={cn("absolute top-1 left-1.5", isSameDay(props.date, today) && "font-bold text-primary")}>
                        {props.date.getDate()}
                      </time>
                      <div className='space-y-1 mt-6 overflow-y-auto max-h-[80px]'>
                        {dayEvents.map(event => {
                          const config = eventConfig[event.type];
                          const assignedMembers = teamMembers.filter(m => event.assigneeIds?.includes(m.id));
                          return (
                            <div key={event.id} role="button" onClick={() => openSheetForEdit(event)} className={cn('w-full text-left text-xs p-1 rounded-sm flex items-start overflow-hidden cursor-pointer relative', config.bgColor, config.color)}>
                              <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                              <span className='ml-1 truncate flex-grow'>{event.title}</span>
                              {assignedMembers.length > 0 && (
                                <div className="absolute bottom-0.5 right-0.5 flex -space-x-1">
                                    {assignedMembers.slice(0, 2).map(member => (
                                        <Avatar key={member.id} className="h-4 w-4 text-white border-background" style={{ backgroundColor: member.avatar.color }}>
                                            <AvatarFallback className="bg-transparent text-[8px] font-bold">
                                                <MemberIcon member={member} className="h-2 w-2" />
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                },
              }}
            />
        </div>
      </main>
      <AddEditEventSheet
        open={isAddEditSheetOpen}
        onOpenChange={setIsAddEditSheetOpen}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        teamMembers={teamMembers}
      />
      <ScheduleInstagramSheet 
        open={isScheduleSheetOpen}
        onOpenChange={setIsScheduleSheetOpen}
        shows={futureShows}
        teamMembers={teamMembers}
        onSchedule={handleScheduleInstagram}
      />
    </>
  );
}
