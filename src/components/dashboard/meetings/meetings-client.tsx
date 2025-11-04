"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, FileText, Search } from 'lucide-react';
import { summarizeMeetingMinutes } from '@/ai/flows/summarize-meeting-minutes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

const pastMeetings = [
    {
        id: 'meeting1',
        title: 'Sesión de Planificación Q3',
        date: new Date('2024-06-15'),
        summary: 'Se decidió la producción principal para la temporada de otoño ("Eco") y se asignó el presupuesto inicial. Marketing comenzará la campaña en agosto.',
        minutes: 'Texto completo de las actas de la Planificación del Q3...'
    },
    {
        id: 'meeting2',
        title: 'Sincronización del Equipo Técnico',
        date: new Date('2024-07-01'),
        summary: 'Bernat confirmó la instalación de la nueva plataforma de iluminación para finales de julio. La revisión del sistema de sonido está completa. No se reportaron problemas importantes.',
        minutes: 'Texto completo de las actas de la Sincronización del Equipo Técnico...'
    }
]

export default function MeetingsClient() {
  const [minutes, setMinutes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!minutes) {
      toast({
        title: 'Error',
        description: 'Por favor, introduce las actas de la reunión para resumir.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeMeetingMinutes({ minutes });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Fallo en la Sumarización con IA',
        description: 'No se pudo generar un resumen. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generar Resumen de Reunión</CardTitle>
          <CardDescription>
            Pega las actas de tu reunión a continuación y deja que la IA extraiga los puntos clave.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="minutes">Actas de la Reunión</Label>
            <Textarea
              id="minutes"
              rows={10}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Pega aquí tus notas de la reunión en bruto..."
            />
          </div>
          <Button onClick={handleSummarize} disabled={isLoading} className="w-full">
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? 'Resumiendo...' : 'Generar Resumen'}
          </Button>
          {isLoading && <Skeleton className="h-24 w-full" />}
          {summary && (
            <div className="p-4 bg-secondary/50 rounded-lg border space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Resumen Generado por IA
              </h4>
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reuniones Anteriores</CardTitle>
          <CardDescription>
            Navega y busca en los registros de reuniones anteriores.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar reuniones..." className="pl-8" />
            </div>
            <Accordion type="single" collapsible className="w-full">
                {pastMeetings.map(meeting => (
                    <AccordionItem value={meeting.id} key={meeting.id}>
                        <AccordionTrigger>
                            <div>
                                <p>{meeting.title}</p>
                                <p className="text-xs text-muted-foreground font-normal">{meeting.date.toLocaleDateString()}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm">{meeting.summary}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
