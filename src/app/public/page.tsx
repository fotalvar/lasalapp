"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createInitialTimeline } from "@/components/dashboard/programming/programming-client";
import { useFirestore } from "@/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { logger } from "@/lib/logger";

export default function PublicPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [castSize, setCastSize] = useState("");

  const handleSaveShow = async () => {
    if (
      !companyName ||
      !contactName ||
      !contactEmail ||
      !type ||
      !title ||
      !description
    ) {
      toast({
        title: "Faltan campos obligatorios",
        description: "Por favor, revisa el formulario.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (!db) throw new Error("Firestore not available");

      // 1. Create Company
      const companyRef = await addDoc(collection(db, "companies"), {
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
        name: "Interacción Personalizada",
        notes: "Contacto de la Compañía con nosotros",
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
        status: "Proposta Pendent" as const,
        timeline: [...timeline, initialInteraction].map((t) => ({
          ...t,
          date: t.date ? Timestamp.fromDate(t.date) : null,
        })),
      };

      await addDoc(collection(db, "shows"), showData);

      toast({
        title: "Propuesta Enviada",
        description:
          "Gracias por tu interés. Hemos recibido tu propuesta correctamente.",
      });

      // Reset form
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setInstagram("");
      setWebsite("");
      setType("");
      setTitle("");
      setDescription("");
      setDuration("");
      setPrice("");
      setCastSize("");
    } catch (error) {
      logger.error("[PublicPage] Error submitting form", error);
      toast({
        title: "Error",
        description:
          "No se pudo enviar la propuesta. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <img src="/logo.png" alt="laSala" className="h-20 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Formulario para nuevas propuestas
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Si tienes un espectáculo que te gustaría presentar en nuestra sala,
          por favor, rellena este formulario.
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Compañía</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nombre de la compañía</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactName">Persona de contacto</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@usuario"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Página Web</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="type">Con qué opción te defines</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Companyia de teatre">
                      Compañía de teatre
                    </SelectItem>
                    <SelectItem value="Músic">Músic</SelectItem>
                    <SelectItem value="Artista plàstic: Il·lustració / Disseny / Escultura">
                      Artista plàstic: Il·lustració / Disseny / Escultura
                    </SelectItem>
                    <SelectItem value="Artista visual: Fotografia / Cinema">
                      Artista visual: Fotografia / Cinema
                    </SelectItem>
                    <SelectItem value="Artista literari: Poesia / Contes">
                      Artista literari: Poesia / Contes
                    </SelectItem>
                    <SelectItem value="Proposta per a públic familiar">
                      Proposta per a públic familiar
                    </SelectItem>
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
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción / Sinopsis</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Durada (min)</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Proposta de PREU</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="castSize">
                    Nombre d'actors/actrius + tècnics
                  </Label>
                  <Input
                    id="castSize"
                    value={castSize}
                    onChange={(e) => setCastSize(e.target.value)}
                  />
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
              ) : (
                "Enviar Propuesta"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
