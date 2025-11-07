"use client";

import { useState, useEffect } from 'react';
import type { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, FilePenLine, Trash2, Users, Mail, Phone, Instagram, Link as LinkIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';

function AddEditCompanySheet({ company, onSave, children }: { company?: Company, onSave: (company: Omit<Company, 'id'> | Company) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [type, setType] = useState('');
    const { toast } = useToast();

    useEffect(() => {
      if (open) {
        setName(company?.name || '');
        setContactName(company?.contactName || '');
        setContactEmail(company?.contactEmail || '');
        setContactPhone(company?.contactPhone || '');
        setInstagram(company?.instagram || '');
        setWebsite(company?.website || '');
        setType(company?.type || '');
      }
    }, [open, company]);

    const handleSave = () => {
        if (!name || !contactName || !contactEmail || !type) {
            toast({ title: "Faltan campos", description: "Por favor, completa todos los campos obligatorios.", variant: "destructive" });
            return;
        }
        
        const companyData = {
            name,
            contactName,
            contactEmail,
            contactPhone,
            instagram,
            website,
            type,
        };
        
        if (company?.id) {
            onSave({ id: company.id, ...companyData });
        } else {
            onSave(companyData);
        }

        setOpen(false);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{company ? 'Editar Compañía' : 'Añadir Nueva Compañía'}</SheetTitle>
                    <SheetDescription>
                        {company ? 'Actualiza los detalles de esta compañía.' : 'Añade una nueva compañía a tu base de datos.'}
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre de la Compañía</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="contactName">Persona de Contacto</Label>
                        <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email de Contacto</Label>
                        <Input id="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono de Contacto</Label>
                        <Input id="phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="website">Página Web</Label>
                        <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select value={type} onValueChange={(value) => setType(value)}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Companyia de teatre">Compañía de teatre</SelectItem>
                                <SelectItem value="Músic">Músic</SelectItem>
                                <SelectItem value="Artista plàstic: Il·lustració / Disseny / Escultura">Artista plàstic: Il·lustració / Disseny / Escultura</SelectItem>
                                <SelectItem value="Artista visual: Fotografia / Cinema">Artista visual: Fotografia / Cinema</SelectItem>
                                <SelectItem value="Artista literari: Poesia / Contes">Artista literari: Poesia / Contes</SelectItem>
                                <SelectItem value="Proposta per a públic familiar">Proposta per a públic familiar</SelectItem>
                                <SelectItem value="Altres">Altres...</SelectItem>
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

export default function CompaniesClient() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;
    const companiesCollection = collection(db, 'companies');
    const unsub = onSnapshot(companiesCollection, (snapshot) => {
        const fetchedCompanies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
        setCompanies(fetchedCompanies);
    }, (error) => {
        const contextualError = new FirestorePermissionError({
          path: companiesCollection.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    });
    return () => unsub();
  }, [db]);


  const handleSaveCompany = async (companyData: Omit<Company, 'id'> | Company) => {
    if (!db) return;
    const isNew = !('id' in companyData);
    if (isNew) {
        addDoc(collection(db, 'companies'), companyData)
            .then(() => toast({ title: "Compañía añadida", description: `${companyData.name} ha sido añadida.` }))
            .catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: 'companies',
                    operation: 'create',
                    requestResourceData: companyData
                }));
            });
    } else {
        const { id, ...dataToSave } = companyData;
        const docRef = doc(db, 'companies', id);
        setDoc(docRef, dataToSave)
            .then(() => toast({ title: "Compañía actualizada", description: `${companyData.name} ha sido actualizada.` }))
            .catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: dataToSave
                }));
            });
    }
  };
  
  const handleDeleteCompany = async (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'companies', id);
    deleteDoc(docRef)
        .then(() => toast({ title: "Compañía eliminada", description: "La compañía ha sido eliminada." }))
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
        <AddEditCompanySheet onSave={handleSaveCompany}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Compañía
            </Button>
        </AddEditCompanySheet>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compañía</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              return (
                <TableRow key={company.id}>
                  <TableCell>
                      <div className="font-medium">{company.name}</div>
                  </TableCell>
                  <TableCell>
                      <div className="font-medium">{company.contactName}</div>
                      <div className="text-sm text-muted-foreground">{company.contactEmail}</div>
                  </TableCell>
                  <TableCell>
                    {company.type}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <AddEditCompanySheet company={company} onSave={handleSaveCompany}>
                            <button className='relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full'>
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Editar
                            </button>
                        </AddEditCompanySheet>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCompany(company.id)}>
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
