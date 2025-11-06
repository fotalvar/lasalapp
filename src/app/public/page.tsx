'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createInitialTimeline } from '@/components/dashboard/programming/programming-client';

const companyTypes = [
  'Companyia de teatre',
  'Músic',
  'Artista plàstic: Il·lustració / Disseny / Escultura',
  'Artista visual: Fotografia / Cinema',
  'Artista literari: Poesia / Contes',
  'Proposta per a públic familiar',
  'Altres...',
];

const formSchema = z.object({
  // Company fields
  companyName: z.string().min(1, 'El nom de la companyia és obligatori.'),
  contactName: z.string().min(1, 'El nom de contacte és obligatori.'),
  contactEmail: z.string().email('Format d\'email invàlid.'),
  contactPhone: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url('URL invàlida.').optional().or(z.literal('')),
  companyType: z.string().min(1, 'Has de seleccionar un tipus.'),

  // Show fields
  showTitle: z.string().min(1, 'El títol de l\'espectacle és obligatori.'),
  showDescription: z.string().min(1, 'La sinopsi és obligatòria.'),
  duration: z.string().min(1, 'La durada és obligatòria.'),
  price: z.string().min(1, 'La proposta de preu és obligatòria.'),
  castSize: z.string().min(1, 'El nombre d\'actors és obligatori.'),
});

type FormData = z.infer<typeof formSchema>;

export default function PublicPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      instagram: '',
      website: '',
      companyType: '',
      showTitle: '',
      showDescription: '',
      duration: '',
      price: '',
      castSize: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!db) {
      toast({
        title: 'Error de connexió',
        description:
          'No s\'ha pogut connectar a la base de dades. Intenta-ho de nou més tard.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the company document
      const companyRef = await addDoc(collection(db, 'companies'), {
        name: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        instagram: data.instagram,
        website: data.website,
        type: data.companyType,
      });

      // 2. Create the show document
      await addDoc(collection(db, 'shows'), {
        title: data.showTitle,
        description: data.showDescription,
        duration: data.duration,
        price: data.price,
        castSize: data.castSize,
        companyId: companyRef.id,
        status: 'Formulario externo',
        timeline: createInitialTimeline(),
      });

      toast({
        title: 'Proposta Enviada!',
        description:
          "Gràcies per enviar la teva proposta. Ens posarem en contacte aviat.",
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting form: ', error);
      toast({
        title: 'Error en l\'enviament',
        description:
          'Hi ha hagut un problema en enviar el formulari. Si us plau, intenta-ho de nou.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Formulari per a Companyies i Artistes</CardTitle>
          <CardDescription>
            Envia la teva proposta artística per a la nostra programació.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Company Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Dades de la Companyia / Artista
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la companyia o artista</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: La Fura dels Baus" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona de contacte</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Joan Pere" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correu electrònic</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Ex: contacte@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telèfon</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="Opcional - Ex: @lasalateatre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pàgina web</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="Opcional - Ex: https://lasalateatre.cat"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="companyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Com us definiu?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccioneu una opció" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Show Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Dades de l'Espectacle / Proposta
                </h3>
                <FormField
                  control={form.control}
                  name="showTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Títol de l'espectacle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Terra Baixa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripció / Sinopsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explica breument de què tracta la teva proposta."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durada</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 90 min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposta de Preu (€)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="castSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actors + Tècnics</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 3 actors, 1 tècnic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviant...
                  </>
                ) : (
                  'Enviar Proposta'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
