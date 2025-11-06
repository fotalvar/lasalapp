

"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Show, TimelineEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, FilePenLine, Trash2, Check, GripVertical, CalendarIcon, Edit } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, addDoc, setDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';


const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Confirmado': 'default',
    'En conversaciones': 'secondary',
    'Idea': 'outline',
    'Archivado': 'destructive',
}

const FIXED_STEPS = [
    'Contacto con la Compañía',
    'Reunión con la Compañía',
    'Condiciones negociadas',
    'Fechas elegidas',
    'Espectáculo confirmado',
];

function createInitialTimeline(): TimelineEvent[] {
    return FIXED_STEPS.map(name => ({
        id: `step-${name.replace(/\s+/g, '-')}`,
        name,
        date: null,
        isCustom: false,
    }));
}


function TimelineInteraction({ 
    event, 
    onUpdate, 
    onDelete 
}: { 
    event: TimelineEvent; 
    onUpdate: (event: TimelineEvent) => void;
    onDelete: (id: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedNotes, setEditedNotes] = useState(event.notes || '');

    const handleSave = () => {
        onUpdate({ ...event, notes: editedNotes });
        setIsEditing(false);
    };
    
    return (
        <div className="flex items-start gap-4 pl-8 relative">
             <div className="absolute left-0 top-1.5 flex flex-col items-center">
                <span className="h-5 w-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                    <GripVertical className="h-4 w-4" />
                </span>
            </div>
            <div className="flex-grow">
                 {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <Textarea 
                            value={editedNotes} 
                            onChange={(e) => setEditedNotes(e.target.value)}
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave}>Guardar</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        </div>
                    </div>
                ) : (
                    <p className="font-semibold text-sm">{event.notes}</p>
                )}

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto font-normal">
                            {event.date ? format(event.date, "d MMM, yyyy 'a las' HH:mm", { locale: es }) : 'Elegir fecha'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={event.date || undefined}
                            onSelect={(date) => onUpdate({ ...event, date: date || null })}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {!isEditing && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className='h-7 w-7'>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(event.id)}>
                             <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

function TimelineStep({ event, onToggle, onDateChange }: { event: TimelineEvent, onToggle: (checked: boolean) => void, onDateChange: (date: Date | undefined) => void }) {
    const isCompleted = !!event.date;
    return (
        <div className="flex items-start gap-4 pl-8 relative">
            <div className="absolute left-0 top-1.5 flex flex-col items-center">
                <span className={cn("h-5 w-5 rounded-full flex items-center justify-center", isCompleted ? "bg-primary text-primary-foreground" : "bg-muted border")}>
                    {isCompleted && <Check className="h-4 w-4" />}
                </span>
            </div>
            <div className="flex-grow">
                <Label
                    htmlFor={event.id}
                    className={cn("font-semibold", isCompleted && "text-muted-foreground line-through")}
                >
                    {event.name}
                </Label>
                {isCompleted ? (
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto font-normal">
                                Completado el {format(event.date!, "d MMM, yyyy", { locale: es })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={event.date || undefined}
                                onSelect={(date) => onDateChange(date || undefined)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                ) : (
                    <p className="text-xs text-muted-foreground">Pendiente</p>
                )}
            </div>
            <Checkbox id={event.id} checked={isCompleted} onCheckedChange={(checked) => onToggle(!!checked)} className="ml-auto" />
        </div>
    );
}


function AddEditShowSheet({ show, onSave, children, open, onOpenChange }: { show?: Show, onSave: (show: Omit<Show, 'id'> | Show) => void, children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [status, setStatus] = useState<Show['status'] | undefined>();
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [newInteractionNote, setNewInteractionNote] = useState('');
    
    useEffect(() => {
        if (open) {
            setTitle(show?.title || '');
            setCompany(show?.company || '');
            setStatus(show?.status);
            const initialTimeline = show?.timeline && show.timeline.length > 0 ? show.timeline : createInitialTimeline();
            const timelineWithDates = initialTimeline.map(t => ({...t, date: t.date instanceof Timestamp ? t.date.toDate() : t.date}));
            setTimeline(timelineWithDates);
            setNewInteractionNote('');
        }
    }, [open, show]);

    const handleSave = () => {
        if (!title || !company || !status) return;
        
        const showData = {
            title,
            company,
            status,
            timeline: timeline.map(t => ({...t, date: t.date ? Timestamp.fromDate(t.date) : null })),
        };

        if (show?.id) {
            onSave({ id: show.id, ...showData });
        } else {
            onSave(showData);
        }

        onOpenChange(false);
    }
    
    const handleToggleStep = (stepId: string, checked: boolean) => {
        setTimeline(currentTimeline => currentTimeline.map(step => 
            step.id === stepId ? { ...step, date: checked ? (step.date || new Date()) : null } : step
        ));
    };

    const handleTimelineUpdate = (updatedEvent: TimelineEvent) => {
        setTimeline(currentTimeline => currentTimeline.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
        ));
    };

    const handleTimelineDelete = (id: string) => {
        setTimeline(currentTimeline => currentTimeline.filter(event => event.id !== id));
    };

    const handleAddInteraction = () => {
        if (!newInteractionNote.trim()) return;
        const newInteraction: TimelineEvent = {
            id: `custom-${Date.now()}`,
            name: 'Interacción Personalizada',
            notes: newInteractionNote.trim(),
            date: new Date(),
            isCustom: true,
        };
        setTimeline(currentTimeline => [...currentTimeline, newInteraction]);
        setNewInteractionNote('');
    };
    
    const sortedTimeline = useMemo(() => {
        return [...timeline].sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date.getTime() - b.date.getTime();
        });
    }, [timeline]);

    const completedSteps = useMemo(() => timeline.filter(t => !t.isCustom && t.date).length, [timeline]);
    const progress = (completedSteps / FIXED_STEPS.length) * 100;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{show ? 'Editar Espectáculo' : 'Añadir Nuevo Espectáculo'}</SheetTitle>
                    <SheetDescription>
                        {show ? 'Actualiza los detalles de este espectáculo.' : 'Añade un nuevo espectáculo a tu seguimiento de programación.'}
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título del Espectáculo</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company">Compañía</Label>
                        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select value={status} onValueChange={(value: Show['status']) => setStatus(value)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Idea">Idea</SelectItem>
                                <SelectItem value="En conversaciones">En conversaciones</SelectItem>
                                <SelectItem value="Confirmado">Confirmado</SelectItem>
                                <SelectItem value="Archivado">Archivado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Progreso de la Programación</Label>
                        <div className="space-y-4 rounded-md border p-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                     <Label className="text-sm">Pasos completados</Label>
                                     <span className="text-sm font-bold">{completedSteps} de {FIXED_STEPS.length}</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                            <div className="space-y-4 relative">
                                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border" />
                                {sortedTimeline.map(event => (
                                    event.isCustom
                                        ? <TimelineInteraction 
                                            key={event.id} 
                                            event={event} 
                                            onUpdate={handleTimelineUpdate}
                                            onDelete={handleTimelineDelete}
                                          />
                                        : <TimelineStep 
                                            key={event.id} 
                                            event={event} 
                                            onToggle={(checked) => handleToggleStep(event.id, checked)}
                                            onDateChange={(date) => handleTimelineUpdate({ ...event, date: date || null })}
                                          />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="interaction">Añadir Interacción Personalizada</Label>
                        <div className="flex gap-2">
                            <Input id="interaction" value={newInteractionNote} onChange={e => setNewInteractionNote(e.target.value)} placeholder="Ej: Llamada de seguimiento..."/>
                            <Button variant="outline" onClick={handleAddInteraction}>Añadir</Button>
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default function ProgrammingClient() {
  const [shows, setShows] = useState<Show[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | undefined>(undefined);
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'shows'), (snapshot) => {
        const fetchedShows = snapshot.docs.map(doc => {
            const data = doc.data();
            const timelineWithDates = (data.timeline || []).map((i: any) => ({...i, date: i.date instanceof Timestamp ? i.date.toDate() : (i.date ? new Date(i.date) : null)}));
            return { 
                id: doc.id, 
                ...data,
                timeline: timelineWithDates
            } as Show;
        });
        setShows(fetchedShows);
    });
    return () => unsub();
  }, [db]);


  const handleSaveShow = async (showData: Omit<Show, 'id'> | Show) => {
    if (!db) return;
    try {
        if ('id' in showData) {
            // Update existing show
            const { id, ...dataToSave } = showData;
            await setDoc(doc(db, 'shows', id), dataToSave);
            toast({ title: "Espectáculo actualizado", description: `${showData.title} ha sido actualizado.` });
        } else {
            // Add new show
            await addDoc(collection(db, 'shows'), showData);
            toast({ title: "Espectáculo añadido", description: `${showData.title} ha sido añadido.` });
        }
    } catch (error) {
        console.error("Error saving show: ", error);
        toast({ title: "Error", description: "No se pudo guardar el espectáculo.", variant: "destructive" });
    }
  }

  const handleDeleteShow = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click from triggering
    if (!db) return;
     try {
        await deleteDoc(doc(db, 'shows', id));
        toast({ title: "Espectáculo eliminado", description: "El espectáculo ha sido eliminado." });
    } catch (error) {
        console.error("Error deleting show: ", error);
        toast({ title: "Error", description: "No se pudo eliminar el espectáculo.", variant: "destructive" });
    }
  }

  const handleRowClick = (show: Show) => {
    setSelectedShow(show);
    setIsSheetOpen(true);
  }

  const handleAddNew = () => {
    setSelectedShow(undefined);
    setIsSheetOpen(true);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Espectáculo
        </Button>
      </div>
      
      <AddEditShowSheet 
        show={selectedShow} 
        onSave={handleSaveShow}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      >
        <div></div>
      </AddEditShowSheet>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título del Espectáculo</TableHead>
              <TableHead>Compañía</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Última Interacción</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shows.map((show) => {
              const lastInteraction = show.timeline && show.timeline.length > 0 
                ? [...show.timeline].filter(t => t.date).sort((a,b) => b.date!.getTime() - a.date!.getTime())[0] 
                : null;
                
              const lastInteractionNote = lastInteraction?.isCustom ? lastInteraction.notes : lastInteraction?.name;

              const truncatedNote = lastInteractionNote 
                ? lastInteractionNote.length > 20 
                  ? `${lastInteractionNote.substring(0, 20)}...`
                  : lastInteractionNote
                : null;
              
              const completedSteps = show.timeline ? show.timeline.filter(t => !t.isCustom && t.date).length : 0;
              const progress = (completedSteps / FIXED_STEPS.length) * 100;
              
              return (
                <TableRow key={show.id} onClick={() => handleRowClick(show)} className="cursor-pointer">
                  <TableCell className="font-medium">{show.title}</TableCell>
                  <TableCell>{show.company}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[show.status] || 'outline'}>{show.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-24 h-2" />
                        <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {lastInteraction?.date ? format(lastInteraction.date, 'd MMM, yyyy', { locale: es }) : 'N/A'}
                      </span>
                      {truncatedNote && (
                        <Badge variant="outline" className="font-normal truncate">{truncatedNote}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(show); }}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteShow(e, show.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Borrar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}



