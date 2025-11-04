
'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { add, endOfDay, endOfMonth, endOfWeek, isSameDay, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { format, es } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/dashboard/page-header';

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
};

const initialEvents: Event[] = [
  {
    id: '1',
    date: add(new Date(), { days: 2 }),
    title: 'Estreno de "Eco"',
    type: 'Espectáculos',
  },
  {
    id: '2',
    date: add(new Date(), { days: 5 }),
    title: 'Post en Instagram para "Laberint"',
    type: 'Publicaciones en redes',
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
  },
  {
    id: '5',
    date: add(new Date(), { days: 1 }),
    title: 'Reunión de producción',
    type: 'Reuniones',
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

function AddEditEventDialog({
  event,
  onSave,
  onDelete,
  children,
}: {
  event?: Event;
  onSave: (event: Event) => void;
  onDelete?: (id: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState<Date | undefined>(event?.date);
  const [type, setType] = useState<EventType | undefined>(event?.type);

  const handleSave = () => {
    if (title && date && type) {
      onSave({
        id: event?.id || `evt-${Date.now()}`,
        title,
        date,
        type,
      });
      setOpen(false);
      if (!event) {
        setTitle('');
        setDate(undefined);
        setType(undefined);
      }
    }
  };
  
  const handleDelete = () => {
    if(event && onDelete) {
      onDelete(event.id);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Evento' : 'Añadir Nuevo Evento'}</DialogTitle>
        </DialogHeader>
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
        </div>
        <DialogFooter className='sm:justify-between'>
          {event && onDelete ? (
            <Button variant="destructive" onClick={handleDelete} className='mr-auto'>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          ) : <div></div>}
          <div className='space-x-2'>
             <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
             <Button onClick={handleSave}>Guardar Evento</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventItem({ event, onEdit }: { event: Event; onEdit: (event: Event) => void }) {
  const config = eventConfig[event.type];
  return (
    <AddEditEventDialog event={event} onSave={onEdit}>
      <button className="flex w-full items-center gap-3 text-left p-2 rounded-lg hover:bg-muted transition-colors">
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
    </AddEditEventDialog>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents.sort((a,b) => a.date.getTime() - b.date.getTime()));
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { locale: es });
  const endOfCurrentWeek = endOfWeek(today, { locale: es });
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const eventsToday = events.filter((e) => isSameDay(e.date, today));
  const eventsWeek = events.filter((e) => e.date >= startOfCurrentWeek && e.date <= endOfCurrentWeek);
  const eventsMonth = events.filter((e) => e.date >= startOfCurrentMonth && e.date <= endOfCurrentMonth);

  return (
    <div className="flex-1">
      <PageHeader
        title="Calendario y Programación"
        description="Gestiona horarios de eventos, funciones confirmadas y actividades de marketing."
      >
        <div className="p-6 pt-0">
          <AddEditEventDialog onSave={handleSaveEvent}>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Evento
            </Button>
          </AddEditEventDialog>
        </div>
      </PageHeader>
      <main className="p-4 md:p-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="p-0"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full',
                caption_label: 'text-base font-bold',
                table: 'w-full border-collapse',
                head_row: 'flex justify-around border-b',
                head_cell: 'text-muted-foreground font-normal text-sm w-full py-2',
                row: 'flex w-full mt-2 justify-around',
                cell: 'h-28 text-sm text-center p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-full w-full p-1 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start hover:bg-accent transition-colors rounded-none',
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
                      <time dateTime={props.date.toISOString()} className={cn("absolute top-1 left-1.5", isSameDay(props.date, new Date()) && "font-bold text-primary")}>
                        {props.date.getDate()}
                      </time>
                      <div className='space-y-1 mt-6 overflow-y-auto max-h-[80px]'>
                        {dayEvents.map(event => {
                          const config = eventConfig[event.type];
                          return (
                            <AddEditEventDialog key={event.id} event={event} onSave={handleSaveEvent} onDelete={handleDeleteEvent}>
                              <button className={cn('w-full text-left text-xs p-1 rounded-sm flex items-center', config.bgColor, config.color)}>
                                {config.icon}
                                <span className='ml-1 truncate'>{event.title}</span>
                              </button>
                            </AddEditEventDialog>
                          )
                        })}
                      </div>
                    </div>
                  );
                },
              }}
            />
        </div>
        <Card>
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
                  eventsToday.map((event) => <EventItem key={event.id} event={event} onEdit={handleSaveEvent} />)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay eventos para hoy.</p>
                )}
              </TabsContent>
              <TabsContent value="week" className="space-y-2 mt-4">
                {eventsWeek.length > 0 ? (
                  eventsWeek.map((event) => <EventItem key={event.id} event={event} onEdit={handleSaveEvent} />)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay eventos esta semana.</p>
                )}
              </TabsContent>
              <TabsContent value="month" className="space-y-2 mt-4">
                 {eventsMonth.length > 0 ? (
                  eventsMonth.map((event) => <EventItem key={event.id} event={event} onEdit={handleSaveEvent} />)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay eventos este mes.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
