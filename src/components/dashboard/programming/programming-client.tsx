
"use client";

import { useState, useEffect } from 'react';
import type { Show } from '@/lib/types';
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
import { MoreHorizontal, PlusCircle, FilePenLine, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, addDoc, setDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Confirmado': 'default',
    'En conversaciones': 'secondary',
    'Idea': 'outline',
    'Archivado': 'destructive',
}

function AddEditShowSheet({ show, onSave, children, open, onOpenChange }: { show?: Show, onSave: (show: Omit<Show, 'id'> | Show) => void, children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [status, setStatus] = useState<Show['status'] | undefined>();
    const [interactions, setInteractions] = useState(show?.interactions || []);
    const [newInteraction, setNewInteraction] = useState('');
    
    useEffect(() => {
        if (open) {
            setTitle(show?.title || '');
            setCompany(show?.company || '');
            setStatus(show?.status);
            // Convert Firebase Timestamps to JS Dates for display
            setInteractions(show?.interactions.map(i => ({...i, date: i.date instanceof Timestamp ? i.date.toDate() : i.date})) || []);
            setNewInteraction('');
        }
    }, [open, show]);

    const handleSave = () => {
        if (!title || !company || !status) return;
        
        const newInteractionEntry = newInteraction.trim();
        let updatedInteractions = [...interactions];

        if (newInteractionEntry) {
            updatedInteractions.push({ date: new Date(), note: newInteractionEntry });
        }
        
        const showData = {
            title,
            company,
            status,
            interactions: updatedInteractions
        };

        if (show?.id) {
            onSave({ id: show.id, ...showData });
        } else {
            onSave(showData);
        }

        onOpenChange(false);
    }

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
                        <Label>Historial de Interacciones</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
                            {interactions.length > 0 ? interactions.sort((a,b) => b.date.getTime() - a.date.getTime()).map((interaction, index) => (
                                <div key={index} className="text-sm">
                                    <span className="font-semibold">{format(interaction.date, 'd MMM, yyyy')}: </span>
                                    <span>{interaction.note}</span>
                                </div>
                            )) : <p className="text-xs text-muted-foreground p-2">Aún no hay interacciones.</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="interaction">Añadir Nueva Interacción</Label>
                        <Textarea id="interaction" value={newInteraction} onChange={e => setNewInteraction(e.target.value)} placeholder="Registra una nueva interacción..."/>
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
            return { 
                id: doc.id, 
                ...data,
                // Ensure interactions have JS Date objects
                interactions: data.interactions?.map((i: any) => ({...i, date: i.date instanceof Timestamp ? i.date.toDate() : new Date(i.date)})) || []
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
        {/* This is a dummy trigger, the sheet is controlled by state */}
        <div></div>
      </AddEditShowSheet>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título del Espectáculo</TableHead>
              <TableHead>Compañía</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última Interacción</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shows.map((show) => {
              const lastInteraction = show.interactions.length > 0 
                ? [...show.interactions].sort((a,b) => b.date.getTime() - a.date.getTime())[0] 
                : null;
                
              const truncatedNote = lastInteraction?.note 
                ? lastInteraction.note.length > 20 
                  ? `${lastInteraction.note.substring(0, 20)}...`
                  : lastInteraction.note
                : null;
              
              return (
                <TableRow key={show.id} onClick={() => handleRowClick(show)} className="cursor-pointer">
                  <TableCell className="font-medium">{show.title}</TableCell>
                  <TableCell>{show.company}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[show.status] || 'outline'}>{show.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {lastInteraction ? format(lastInteraction.date, 'd MMM, yyyy') : 'N/A'}
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
                         <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
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

