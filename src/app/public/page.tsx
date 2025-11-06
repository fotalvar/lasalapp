'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createInitialTimeline } from '@/components/dashboard/programming/programming-client';
import { useFirestore } from '@/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

export default function PublicPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const db = useFirestore();

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [castSize, setCastSize] = useState('');

    const handleSaveShow = async () => {
        if (!companyName || !contactName || !contactEmail || !type || !title || !description) {
            toast({ title: "Faltan campos obligatorios", description: "Por favor, revisa el formulario.", variant: "destructive" });
            return;
        }
        
        try {
            setIsSubmitting(true);
            if (!db) throw new Error("Firestore not available");

            // 1. Create Company
            const companyRef = await addDoc(collection(db, 'companies'), {
                name: companyName,
                contactName,
                contactEmail,
                contactPhone,
                instagram,
                website,
                type,
            });

            // 2. Create Show with a link to the company
            const timeline = createInitialTimeline();
            const initialInteraction = {
                id: `custom-${Date.now()}`,
                name: 'Interacción Personalizada',
                notes: 'Contacto de la Compañía con nosotros',
                date: new Date(),
                isCustom: true,
            };
            
            const showData = {
                title,
                companyId: companyRef.id,
                description,
                duration,
                price,
                castSize,
                status: 'Proposta Pendent' as const,
                timeline: [...timeline, initialInteraction].map(t => ({...t, date: t.date ? Timestamp.fromDate(t.date) : null })),
            };

            await addDoc(collection(db, 'shows'), showData);

            toast({ title: "Propuesta Enviada", description: "Gracias por tu interés. Hemos recibido tu propuesta correctamente." });
            
            // Reset form
            setCompanyName('');
            setContactName('');
            setContactEmail('');
            setContactPhone('');
            setInstagram('');
            setWebsite('');
            setType('');
            setTitle('');
            setDescription('');
            setDuration('');
            setPrice('');
            setCastSize('');

        } catch (error) {
            console.error("Error submitting form: ", error);
            toast({ title: "Error", description: "No se pudo enviar la propuesta. Inténtalo de nuevo más tarde.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
             <div className="flex items-center justify-center gap-2 mb-6 text-center">
                <svg
                    width="60"
                    height="60"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        d="M57.1755 0.999982C57.1755 0.999982 43.1595 1.00002 38.0475 1C31.5275 0.999968 25.4955 3.32798 25.4955 11.724C25.4955 20.12 31.0395 24.504 38.0475 24.504C45.0555 24.504 57.1755 20.12 57.1755 11.724C57.1755 3.32798 57.1755 0.999982 57.1755 0.999982Z"
                        fill="#F5F5F5"
                        stroke="#1C1C1C"
                        strokeWidth="2"
                    />
                    <path
                        d="M50.7197 99C29.5677 99 14.1597 81.332 14.1597 62.9C14.1597 48.068 21.9757 34.608 34.9037 29.568C38.0157 28.224 43.1597 27.432 45.8637 28.224C47.8437 28.776 50.7197 30.12 50.7197 30.12L50.7197 29.568L58.2077 28.776L59.3957 29.568C72.3237 34.608 80.1397 48.068 80.1397 62.9C80.1397 81.332 64.9197 99 50.7197 99Z"
                        fill="#F5F5F5"
                    />
                    <path
                        d="M50.7197 99C29.5677 99 14.1597 81.332 14.1597 62.9C14.1597 48.068 21.9757 34.608 34.9037 29.568C38.0157 28.224 43.1597 27.432 45.8637 28.224C47.8437 28.776 50.7197 30.12 50.7197 30.12L50.7197 29.568L58.2077 28.776L59.3957 29.568C72.3237 34.608 80.1397 48.068 80.1397 62.9C80.1397 81.332 64.9197 99 50.7197 99Z"
                        stroke="#1C1C1C"
                        strokeWidth="2"
                    />
                    <path
                        d="M47.7887 31.848C47.7887 31.848 48.6527 34.056 46.4447 34.608C44.2367 35.16 42.1487 34.056 42.1487 34.056"
                        stroke="#1C1C1C"
                        strokeWidth="2"
                    />
                    <path
                        d="M59.3957 31.848C59.3957 31.848 58.5317 34.056 60.7397 34.608C62.9477 35.16 65.0357 34.056 65.0357 34.056"
                        stroke="#1C1C1C"
                        strokeWidth="2"
                    />
                    <path
                        d="M53.8828 41.832C53.3308 43.176 52.1548 44.232 50.7188 44.232C49.2828 44.232 48.1068 43.176 47.5548 41.832"
                        stroke="#1C1C1C"
                        strokeWidth="2"
                    />
                    <path
                        d="M28.5117 76.812C28.5117 76.812 40.6397 84.888 56.8877 75.468C66.5277 69.828 72.3237 60.132 72.3237 60.132"
                        stroke="#1C1C1C"
                        strokeWidth="2"
                    />
                </svg>
                <span className="font-bold text-3xl">laSalapp</span>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Formulario para nuevas propuestas</h1>
            <p className="text-muted-foreground text-center mb-8">Si tienes un espectáculo que te gustaría presentar en nuestra sala, por favor, rellena este formulario.</p>
            
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Compañía</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Nombre de la compañía</Label>
                            <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactName">Persona de contacto</Label>
                            <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactEmail">Email</Label>
                            <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactPhone">Teléfono</Label>
                            <Input id="contactPhone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input id="instagram" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="website">Página Web</Label>
                            <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                             <Label htmlFor="type">Con qué opción te defines</Label>
                            <Select value={type} onValueChange={setType}>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Espectáculo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título del espectáculo</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción / Sinopsis</Label>
                            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Durada (min)</Label>
                                <Input id="duration" value={duration} onChange={e => setDuration(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Proposta de PREU</Label>
                                <Input id="price" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="castSize">Nombre d'actors/actrius + tècnics</Label>
                                <Input id="castSize" value={castSize} onChange={e => setCastSize(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" onClick={handleSaveShow} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : 'Enviar Propuesta'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
