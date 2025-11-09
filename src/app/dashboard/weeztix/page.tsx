"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageHeader from "@/components/dashboard/page-header";

type WeeztixEvent = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  venue?: {
    name: string;
    address?: string;
    city?: string;
  };
  image?: string;
  ticketsSold?: number;
  ticketsAvailable?: number;
};

export default function WeeztixPage() {
  const [events, setEvents] = useState<WeeztixEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    loadWeeztixEvents();
  }, []);

  const loadWeeztixEvents = async () => {
    setIsLoading(true);
    setError(null);
    setNeedsAuth(false);

    try {
      // Call Next.js API route instead of Firebase Function
      const response = await fetch("/api/weeztix/events");

      if (response.status === 401) {
        const data = await response.json();
        if (data.needsAuth) {
          setNeedsAuth(true);
          setError("Necesitas autorizar el acceso a Weeztix");
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Parse the events data based on Weeztix API response structure
      if (data.events && Array.isArray(data.events.data)) {
        setEvents(data.events.data);
      } else if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.error("Error loading Weeztix events:", err);
      setError(err.message || "Error al cargar eventos de Weeztix");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorize = () => {
    // Redirect to OAuth authorization
    window.location.href = "/api/weeztix/authorize";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      draft: { label: "Borrador", variant: "secondary" },
      published: { label: "Publicado", variant: "default" },
      active: { label: "Activo", variant: "default" },
      ended: { label: "Finalizado", variant: "outline" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || {
      label: status,
      variant: "outline" as const,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const openInWeeztix = (eventId: string) => {
    window.open(
      `https://dashboard.weeztix.com/events/${eventId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Eventos de Weeztix" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-muted-foreground">Cargando eventos...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Eventos de Weeztix" />
        <div className="px-4 md:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            {needsAuth ? (
              <Button onClick={handleAuthorize}>
                Autorizar acceso a Weeztix
              </Button>
            ) : (
              <Button onClick={loadWeeztixEvents}>Reintentar</Button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Eventos de Weeztix">
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                "https://dashboard.weeztix.com/eventSettings/simple/basic",
                "_blank"
              )
            }
          >
            <Ticket className="h-4 w-4 mr-2" />
            Crear Evento
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://dashboard.weeztix.com/events", "_blank")
            }
          >
            Ver en Weeztix
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
          <Button onClick={loadWeeztixEvents}>Actualizar</Button>
        </div>
      </PageHeader>

      <div className="px-4 md:px-6 pb-6">
        {events.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No hay eventos</p>
              <p className="text-muted-foreground mb-4">
                Crea tu primer evento en Weeztix para empezar a vender entradas
              </p>
              <Button
                onClick={() =>
                  window.open(
                    "https://dashboard.weeztix.com/eventSettings/simple/basic",
                    "_blank"
                  )
                }
              >
                <Ticket className="h-4 w-4 mr-2" />
                Crear Evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {event.image && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                    {event.status && getStatusBadge(event.status)}
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.startDate && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                  )}

                  {event.venue && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium">{event.venue.name}</div>
                        {(event.venue.address || event.venue.city) && (
                          <div className="text-muted-foreground">
                            {event.venue.address}
                            {event.venue.address && event.venue.city && ", "}
                            {event.venue.city}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(event.ticketsSold !== undefined ||
                    event.ticketsAvailable !== undefined) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.ticketsSold || 0} vendidas
                        {event.ticketsAvailable !== undefined &&
                          ` / ${event.ticketsAvailable} disponibles`}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => openInWeeztix(event.id)}
                  >
                    Ver en Weeztix
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
