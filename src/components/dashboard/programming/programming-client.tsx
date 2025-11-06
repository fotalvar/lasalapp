
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Check, GripVertical, Edit, CalendarIcon, ChevronDown } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';


const statusOptions: Show['status'][] = ['Idea', 'En conversaciones', 'Confirmado', 'Archivado'];
const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Confirmado': 'default',
    'En conversaciones': 'secondary',
    'Idea': 'outline',
    'Archivado': 'destructive',
}

const FIXED_STEPS = [
    'Contacto con la Compañía',
    'Reunión con la Compañía',
    'Descripción',
    'Imágenes',
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
            <div className="flex-grow flex items-center gap-4">
                <div className="flex-grow">
                    <Label
                        htmlFor={event.id}
                        className={cn("font-semibold", isCompleted && "text-muted-foreground line-through")}
                    >
                        {event.name}
                    </Label>
                    {isCompleted && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto font-normal block">
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
                    )}
                </div>
                 <Checkbox id={event.id} checked={isCompleted} onCheckedChange={(checked) => onToggle(!!checked)} className="ml-auto" />
            </div>
        </div>
    );
}


function AddEditShowSheet({ show, onSave, onDelete, children, open, onOpenChange }: { show?: Show, onSave: (show: Omit<Show, 'id'> | Show) => void, onDelete: (id: string) => void, children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) {
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
    
    const handleDelete = () => {
        if (show) {
            onDelete(show.id);
            onOpenChange(false);
        }
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
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
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
                                {statusOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
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
                    <div className='flex justify-between w-full'>
                        {show ? (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="mr-auto">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el espectáculo
                                        y todos sus datos asociados.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ): <div></div>}
                        <div className='space-x-2'>
                           <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                           <Button onClick={handleSave}>Guardar</Button>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function StatusBadge({ show, onStatusChange }: { show: Show; onStatusChange: (status: Show['status']) => void; }) {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    badgeVariants({ variant: statusColors[show.status] || 'outline' }),
                    "hover:opacity-80"
                )}
            >
                {show.status}
                <ChevronDown className="ml-1 h-3 w-3" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
            <DropdownMenuRadioGroup value={show.status} onValueChange={(value) => onStatusChange(value as Show['status'])}>
                {statusOptions.map(option => (
                    <DropdownMenuRadioItem key={option} value={option}>{option}</DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProgrammingClient() {
  const [shows, setShows] = useState<Show[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<Show['status'] | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { badgeVariants } = require('@/components/ui/badge');

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
    }, (error) => {
        console.error("Error fetching shows:", error);
        toast({ title: "Error", description: "No se pudieron cargar los espectáculos.", variant: "destructive" });
    });
    return () => unsub();
  }, [db, toast]);

  const filteredShows = useMemo(() => {
    return shows.filter(show => {
      const completedSteps = show.timeline?.filter(t => !t.isCustom && t.date).length || 0;
      const progress = (completedSteps / FIXED_STEPS.length) * 100;
      
      const isCompleted = progress === 100;
      if (!showCompleted && isCompleted) {
        return false;
      }

      if (statusFilter !== 'all' && show.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [shows, statusFilter, showCompleted]);


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

  const handleStatusChange = (show: Show, newStatus: Show['status']) => {
    const updatedShow = { ...show, status: newStatus };
    handleSaveShow(updatedShow);
  }

  const handleDeleteShow = async (id: string) => {
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

  const renderDesktopView = () => (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título del Espectáculo</TableHead>
              <TableHead>Compañía</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Última Interacción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderShowItems()}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className='space-y-3'>
      {renderShowItems()}
    </div>
  );

  const renderShowItems = () => {
      return filteredShows.map((show) => {
        const lastInteraction = show.timeline && show.timeline.length > 0 
          ? [...show.timeline].filter(t => t.date).sort((a,b) => b.date!.getTime() - a.date!.getTime())[0] 
          : null;
          
        const lastInteractionNote = lastInteraction?.isCustom ? lastInteraction.notes : lastInteraction?.name;
        
        const completedSteps = show.timeline ? show.timeline.filter(t => !t.isCustom && t.date).length : 0;
        const progress = (completedSteps / FIXED_STEPS.length) * 100;

        if (isMobile) {
          return (
            <Card key={show.id} onClick={() => handleRowClick(show)} className="cursor-pointer">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{show.title}</p>
                    <p className="text-sm text-muted-foreground">{show.company}</p>
                  </div>
                  <StatusBadge show={show} onStatusChange={(newStatus) => handleStatusChange(show, newStatus)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-full h-2" />
                    <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>
                 {lastInteraction && (
                  <div className="text-sm text-muted-foreground">
                    <span>Última Interacción: </span>
                    <span className="font-medium">{format(lastInteraction.date!, 'd MMM, yyyy', { locale: es })}</span>
                  </div>
                 )}
              </CardContent>
            </Card>
          )
        }
        
        return (
          <TableRow key={show.id} onClick={() => handleRowClick(show)} className="cursor-pointer">
            <TableCell className="font-medium">{show.title}</TableCell>
            <TableCell>{show.company}</TableCell>
            <TableCell>
              <StatusBadge show={show} onStatusChange={(newStatus) => handleStatusChange(show, newStatus)} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-24 h-2" />
                  <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {lastInteraction?.date && (
                   <span>{format(lastInteraction.date, 'd MMM, yyyy', { locale: es })}</span>
                )}
                {lastInteractionNote && (
                  <Badge variant="outline" className="font-normal truncate max-w-xs">{lastInteractionNote}</Badge>
                )}
              </div>
            </TableCell>
          </TableRow>
        );
      });
  }

  return (
    <>
      <div className="flex flex-col mb-4 gap-4">
        <div className="flex justify-end">
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Espectáculo
            </Button>
        </div>
        <div className="flex flex-row items-center gap-4 w-full">
            <Select value={statusFilter} onValueChange={(value: Show['status'] | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {statusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
                <Checkbox id="show-completed" checked={showCompleted} onCheckedChange={(checked) => setShowCompleted(!!checked)} />
                <label
                    htmlFor="show-completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Mostrar completados
                </label>
            </div>
        </div>
      </div>
      
      <AddEditShowSheet 
        show={selectedShow} 
        onSave={handleSaveShow}
        onDelete={handleDeleteShow}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      >
        <div></div>
      </AddEditShowSheet>

      {isMobile ? renderMobileView() : renderDesktopView()}
    </>
  );
}

    

    

    