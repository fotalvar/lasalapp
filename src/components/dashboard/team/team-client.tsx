"use client";

import { useState, useEffect } from 'react';
import type { TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, FilePenLine, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';

const roleColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Administrador': 'default',
    'Técnico': 'secondary',
    'Usuario': 'outline',
}

const availableIcons = {
    'Usuario': 'User',
    'Engranaje': 'Cog',
    'Paleta': 'Palette',
    'Ancla': 'Anchor',
    'Maletín': 'Briefcase',
    'Pluma': 'Feather',
    'Corazón': 'Heart',
    'Sol': 'Sun',
    'Luna': 'Moon',
    'Estrella': 'Star',
    'Cámara': 'Camera',
    'Gato': 'Cat',
    'Perro': 'Dog',
    'Pájaro': 'Bird',
    'Pez': 'Fish',
    'Conejo': 'Rabbit',
    'Tortuga': 'Turtle',
} as const;

type SpanishIconName = keyof typeof availableIcons;
type LucideIconName = typeof availableIcons[SpanishIconName];


const availableColors = ['#dc2626', '#f97316', '#facc15', '#4d7c0f', '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777', '#be123c'];

function Icon({ name }: { name: string }) {
    const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
    if (!IconComponent) return <LucideIcons.User className="h-5 w-5" />;
    return <IconComponent className="h-5 w-5" />;
}

function AddEditMemberSheet({ member, onSave, children }: { member?: TeamMember, onSave: (member: Omit<TeamMember, 'id'> | TeamMember) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamMember['role'] | undefined>();
    const [icon, setIcon] = useState('User');
    const [color, setColor] = useState('#2563eb');
    const { toast } = useToast();

    useEffect(() => {
      if (open) {
        setName(member?.name || '');
        setEmail(member?.email || '');
        setRole(member?.role);
        setIcon(member?.avatar?.icon || 'User');
        setColor(member?.avatar?.color || '#2563eb');
      }
    }, [open, member]);

    const handleSave = () => {
        if (!name || !email || !role || !icon || !color) {
            toast({ title: "Faltan campos", description: "Por favor, completa todos los campos para guardar el miembro.", variant: "destructive" });
            return;
        }
        
        const memberData = {
            name,
            email,
            role,
            avatar: { icon, color },
        };
        
        if (member?.id) {
            onSave({ id: member.id, ...memberData });
        } else {
            onSave(memberData);
        }

        setOpen(false);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{member ? 'Editar Miembro' : 'Añadir Nuevo Miembro'}</SheetTitle>
                    <SheetDescription>
                        {member ? 'Actualiza los detalles de este miembro del equipo.' : 'Añade un nuevo miembro a tu equipo.'}
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-16 w-16 text-white" style={{ backgroundColor: color }}>
                            <AvatarFallback className="bg-transparent">
                                <Icon name={icon} />
                            </AvatarFallback>
                        </Avatar>
                        <div className='grid grid-cols-2 gap-2 flex-1'>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className='w-full justify-start'>
                                        <Icon name={icon} /> <span className='ml-2'>{Object.entries(availableIcons).find(([, lucideName]) => lucideName === icon)?.[0] || icon}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-2'>
                                    <div className='grid grid-cols-4 gap-2'>
                                        {(Object.keys(availableIcons) as SpanishIconName[]).map(spanishName => (
                                            <Button key={spanishName} variant={icon === availableIcons[spanishName] ? "secondary" : "ghost"} size="icon" onClick={() => setIcon(availableIcons[spanishName])} title={spanishName}>
                                                <Icon name={availableIcons[spanishName]} />
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                             <Popover>
                                <PopoverTrigger asChild>
                                     <Button variant="outline" className='w-full justify-start'>
                                        <div className='w-4 h-4 rounded-full border' style={{backgroundColor: color}}/>
                                        <span className='ml-2'>Color</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-2'>
                                    <div className='grid grid-cols-8 gap-1'>
                                        {availableColors.map(c => (
                                            <button key={c} onClick={() => setColor(c)} className={cn('w-6 h-6 rounded-full border', color === c && 'ring-2 ring-ring ring-offset-2 ring-offset-background')}>
                                                <div className='w-full h-full rounded-full' style={{backgroundColor: c}}/>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={role} onValueChange={(value: TeamMember['role']) => setRole(value)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Administrador">Administrador</SelectItem>
                                <SelectItem value="Técnico">Técnico</SelectItem>
                                <SelectItem value="Usuario">Usuario</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter>
                     <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default function TeamClient() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;
    const teamMembersCollection = collection(db, 'teamMembers');
    const unsub = onSnapshot(teamMembersCollection, (snapshot) => {
        const fetchedMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
        setMembers(fetchedMembers);
    }, (error) => {
        const contextualError = new FirestorePermissionError({
            path: teamMembersCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    });
    return () => unsub();
  }, [db]);


  const handleSaveMember = (memberData: Omit<TeamMember, 'id'> | TeamMember) => {
    if (!db) return;
    const isNew = !('id' in memberData);
    if (isNew) {
        addDoc(collection(db, 'teamMembers'), memberData)
            .then(() => toast({ title: "Miembro añadido", description: `${memberData.name} ha sido añadido al equipo.` }))
            .catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: 'teamMembers',
                    operation: 'create',
                    requestResourceData: memberData,
                }));
            });
    } else {
        const { id, ...dataToSave } = memberData;
        const docRef = doc(db, 'teamMembers', id);
        setDoc(docRef, dataToSave)
            .then(() => toast({ title: "Miembro actualizado", description: `${memberData.name} ha sido actualizado.` }))
            .catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: dataToSave
                }));
            });
    }
  };
  
  const handleDeleteMember = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'teamMembers', id);
    deleteDoc(docRef)
        .then(() => toast({ title: "Miembro eliminado", description: "El miembro del equipo ha sido eliminado." }))
        .catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete'
            }));
        });
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <AddEditMemberSheet onSave={handleSaveMember}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Miembro
            </Button>
        </AddEditMemberSheet>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 text-white" style={{ backgroundColor: member.avatar.color }}>
                        <AvatarFallback className="bg-transparent">
                          {member.avatar?.icon ? <Icon name={member.avatar.icon} /> : member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColors[member.role] || 'outline'}>{member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <AddEditMemberSheet member={member} onSave={handleSaveMember}>
                            <button className='relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full'>
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Editar
                            </button>
                        </AddEditMemberSheet>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
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
