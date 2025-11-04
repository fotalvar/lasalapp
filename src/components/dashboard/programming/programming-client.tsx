"use client";

import { useState } from 'react';
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

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Confirmado': 'default',
    'En conversaciones': 'secondary',
    'Idea': 'outline',
    'Archivado': 'destructive',
}

function AddEditShowSheet({ show, onSave, children }: { show?: Show, onSave: (show: Show) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(show?.title || '');
    const [company, setCompany] = useState(show?.company || '');
    const [status, setStatus] = useState<Show['status'] | undefined>(show?.status);
    const [interactions, setInteractions] = useState(show?.interactions || []);
    const [newInteraction, setNewInteraction] = useState('');

    const handleSave = () => {
        if (!title || !company || !status) return;
        const updatedInteractions = newInteraction
            ? [...interactions, { date: new Date(), note: newInteraction }]
            : interactions;

        const newShow: Show = {
            id: show?.id || `show-${Date.now()}`,
            title,
            company,
            status,
            interactions: updatedInteractions
        };
        onSave(newShow);
        setOpen(false);
        if (!show) {
            setTitle('');
            setCompany('');
            setStatus(undefined);
            setInteractions([]);
        }
        setNewInteraction('');
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
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
                            {interactions.length > 0 ? interactions.map((interaction, index) => (
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
                    <SheetClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </SheetClose>
                    <Button onClick={handleSave}>Guardar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default function ProgrammingClient({ initialShows }: { initialShows: Show[] }) {
  const [shows, setShows] = useState(initialShows);

  const handleSaveShow = (show: Show) => {
    setShows(prev => {
        const existing = prev.find(s => s.id === show.id);
        if (existing) {
            return prev.map(s => s.id === show.id ? show : s);
        }
        return [show, ...prev];
    })
  }

  const handleDeleteShow = (id: string) => {
    setShows(prev => prev.filter(s => s.id !== id));
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <AddEditShowSheet onSave={handleSaveShow}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Espectáculo
          </Button>
        </AddEditShowSheet>
      </div>
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
            {shows.map((show) => (
              <TableRow key={show.id}>
                <TableCell className="font-medium">{show.title}</TableCell>
                <TableCell>{show.company}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[show.status] || 'outline'}>{show.status}</Badge>
                </TableCell>
                <TableCell>
                  {show.interactions.length > 0 ? format(show.interactions[show.interactions.length - 1].date, 'd MMM, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <AddEditShowSheet show={show} onSave={handleSaveShow}>
                           <button className='relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full'>
                              <FilePenLine className="mr-2 h-4 w-4" />
                              Editar
                          </button>
                       </AddEditShowSheet>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteShow(show.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Borrar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
