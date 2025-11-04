
'use client';

import PageHeader from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar as CalendarIcon,
  Megaphone,
  PlusCircle,
  Ticket,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Event = {
  date: Date;
  title: string;
  type: 'performance' | 'marketing' | 'tickets' | 'other';
};

const initialEvents: Event[] = [
  {
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    title: 'Eco - Noche de estreno',
    type: 'performance',
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    title: 'Publicación en redes sociales para Laberint',
    type: 'marketing',
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 8)),
    title: 'Entradas anticipadas a la venta',
    type: 'tickets',
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 9)),
    title: 'Eco - Función',
    type: 'performance',
  },
];

const eventIcons = {
  performance: <CalendarIcon className="h-4 w-4 text-muted-foreground" />,
  marketing: <Megaphone className="h-4 w-4 text-muted-foreground" />,
  tickets: <Ticket className="h-4 w-4 text-muted-foreground" />,
  other: <PlusCircle className="h-4 w-4 text-muted-foreground" />,
};

function AddEventDialog({ onAddEvent }: { onAddEvent: (event: Event) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [type, setType] = useState<Event['type'] | undefined>();

  const handleSave = () => {
    if (title && date && type) {
      onAddEvent({ title, date, type });
      setOpen(false);
      setTitle('');
      setDate(undefined);
      setType(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Evento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Evento</DialogTitle>
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
            <Select value={type} onValueChange={(v: Event['type']) => setType(v)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Función</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="tickets">Entradas</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Guardar Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddEvent = (event: Event) => {
    setEvents((prev) => [...prev, event].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const upcomingEvents = events.filter((event) => event.date >= new Date()).slice(0, 5);
  const eventDays = events.map((event) => event.date);

  return (
    <div className="flex-1">
      <PageHeader
        title="Calendario y Programación"
        description="Gestiona horarios de eventos, funciones confirmadas y actividades de marketing."
      />
      <main className="p-4 md:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => setSelectedDate(day || new Date())}
              className="rounded-md"
              modifiers={{ event: eventDays }}
              modifiersStyles={{
                event: {
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                },
              }}
              components={{
                DayContent: (props) => {
                  const isEventDay = eventDays.some(
                    (eventDate) =>
                      format(eventDate, 'yyyy-MM-dd') === format(props.date, 'yyyy-MM-dd')
                  );
                  return (
                    <div className="relative h-full w-full">
                      {props.date.getDate()}
                      {isEventDay && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                },
              }}
              classNames={{
                months:
                  'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex justify-around',
                head_cell:
                  'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                row: 'flex w-full mt-2 justify-around',
                cell: 'h-14 w-14 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-14 w-14 p-0 font-normal aria-selected:opacity-100',
                day_selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximos Eventos</CardTitle>
            <AddEventDialog onAddEvent={handleAddEvent} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    {eventIcons[event.type]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, 'PPP', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay eventos próximos.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
