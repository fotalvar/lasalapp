"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Show, TimelineEvent, Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Check,
  GripVertical,
  Edit,
  ChevronDown,
  Users,
  Mail,
  Phone,
  Instagram,
  Link as LinkIcon,
  Info,
  CalendarPlus,
  Eye,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  useFirestore,
  errorEmitter,
  FirestorePermissionError,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

const statusOptions: Show["status"][] = [
  "Idea",
  "En conversaciones",
  "Confirmado",
  "Proposta Pendent",
  "Archivado",
];
const statusColors: {
  [key: string]:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "warning";
} = {
  Confirmado: "default",
  "En conversaciones": "secondary",
  "Proposta Pendent": "warning",
  Idea: "outline",
  Archivado: "destructive",
};

const FIXED_STEPS = [
  "Contacto con la Compañía",
  "Reunión con la Compañía",
  "Descripción",
  "Imágenes",
  "Condiciones negociadas",
  "Fechas elegidas",
  "Espectáculo confirmado",
];

export function createInitialTimeline(): TimelineEvent[] {
  return FIXED_STEPS.map((name) => ({
    id: `step-${name.replace(/\s+/g, "-")}`,
    name,
    date: null,
    isCustom: false,
  }));
}

function TimelineInteraction({
  event,
  onUpdate,
  onDelete,
}: {
  event: TimelineEvent;
  onUpdate: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(event.notes || "");

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
              <Button size="sm" onClick={handleSave}>
                Guardar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="font-semibold text-sm">{event.notes}</p>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground p-0 h-auto font-normal"
            >
              {event.date
                ? format(event.date, "d MMM, yyyy 'a las' HH:mm", {
                    locale: es,
                  })
                : "Elegir fecha"}
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
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function TimelineStep({
  event,
  onToggle,
  onDateChange,
}: {
  event: TimelineEvent;
  onToggle: (checked: boolean) => void;
  onDateChange: (date: Date | undefined) => void;
}) {
  const isCompleted = !!event.date;
  return (
    <div className="flex items-start gap-4 pl-8 relative">
      <div className="absolute left-0 top-1.5 flex flex-col items-center">
        <span
          className={cn(
            "h-5 w-5 rounded-full flex items-center justify-center",
            isCompleted
              ? "bg-primary text-primary-foreground"
              : "bg-muted border"
          )}
        >
          {isCompleted && <Check className="h-4 w-4" />}
        </span>
      </div>
      <div className="flex-grow flex items-center gap-4">
        <div className="flex-grow">
          <Label
            htmlFor={event.id}
            className={cn(
              "font-semibold",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {event.name}
          </Label>
          {isCompleted && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-muted-foreground p-0 h-auto font-normal block"
                >
                  Completado el{" "}
                  {format(event.date!, "d MMM, yyyy", { locale: es })}
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
        <Checkbox
          id={event.id}
          checked={isCompleted}
          onCheckedChange={(checked) => onToggle(!!checked)}
          className="ml-auto"
        />
      </div>
    </div>
  );
}

function AddEditShowSheet({
  show,
  companies,
  onSave,
  onDelete,
  children,
  open,
  onOpenChange,
}: {
  show?: Show;
  companies: Company[];
  onSave: (
    show: Omit<Show, "id" | "company"> | (Show & { company?: Company })
  ) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState<string | undefined>();
  const [status, setStatus] = useState<Show["status"] | undefined>();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [newInteractionNote, setNewInteractionNote] = useState("");

  const [initialState, setInitialState] = useState<string>("");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    const currentState = JSON.stringify({ title, companyId, status, timeline });
    return currentState !== initialState;
  }, [title, companyId, status, timeline, initialState]);

  useEffect(() => {
    if (open) {
      const currentShowState = {
        title: show?.title || "",
        companyId: show?.companyId || undefined,
        status: show?.status,
        timeline:
          show?.timeline && show.timeline.length > 0
            ? show.timeline.map((t) => ({
                ...t,
                date: t.date instanceof Timestamp ? t.date.toDate() : t.date,
              }))
            : createInitialTimeline(),
      };
      setTitle(currentShowState.title);
      setCompanyId(currentShowState.companyId);
      setStatus(currentShowState.status);
      setTimeline(currentShowState.timeline);
      setNewInteractionNote("");

      setInitialState(JSON.stringify(currentShowState));
    }
  }, [open, show]);

  const handleSave = () => {
    if (!title || !companyId || !status) return;

    const showData = {
      title,
      companyId,
      status,
      timeline: timeline.map((t) => ({
        ...t,
        date: t.date ? Timestamp.fromDate(t.date) : null,
      })),
    };

    if (show?.id) {
      onSave({ id: show.id, ...showData });
    } else {
      onSave(showData);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (show) {
      onDelete(show.id);
      onOpenChange(false);
    }
  };

  const handleCloseAttempt = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && hasUnsavedChanges) {
        setShowUnsavedDialog(true);
      } else {
        onOpenChange(isOpen);
      }
    },
    [hasUnsavedChanges, onOpenChange]
  );

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onOpenChange(false);
  };

  const handleToggleStep = (stepId: string, checked: boolean) => {
    setTimeline((currentTimeline) =>
      currentTimeline.map((step) =>
        step.id === stepId
          ? { ...step, date: checked ? step.date || new Date() : null }
          : step
      )
    );
  };

  const handleTimelineUpdate = (updatedEvent: TimelineEvent) => {
    setTimeline((currentTimeline) =>
      currentTimeline.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleTimelineDelete = (id: string) => {
    setTimeline((currentTimeline) =>
      currentTimeline.filter((event) => event.id !== id)
    );
  };

  const handleAddInteraction = () => {
    if (!newInteractionNote.trim()) return;
    const newInteraction: TimelineEvent = {
      id: `custom-${Date.now()}`,
      name: "Interacción Personalizada",
      notes: newInteractionNote.trim(),
      date: new Date(),
      isCustom: true,
    };
    setTimeline((currentTimeline) => [...currentTimeline, newInteraction]);
    setNewInteractionNote("");
  };

  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.getTime() - b.date.getTime();
    });
  }, [timeline]);

  const completedSteps = useMemo(
    () => timeline.filter((t) => !t.isCustom && t.date).length,
    [timeline]
  );
  const progress = (completedSteps / FIXED_STEPS.length) * 100;

  return (
    <>
      <Sheet open={open} onOpenChange={handleCloseAttempt}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {show ? "Editar Espectáculo" : "Añadir Nuevo Espectáculo"}
            </SheetTitle>
            <SheetDescription>
              {show
                ? "Actualiza los detalles de este espectáculo."
                : "Añade un nuevo espectáculo a tu seguimiento de programación."}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título del Espectáculo</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Compañía</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecciona una compañía" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value: Show["status"]) => setStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
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
                    <span className="text-sm font-bold">
                      {completedSteps} de {FIXED_STEPS.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="space-y-4 relative">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border" />
                  {sortedTimeline.map((event) =>
                    event.isCustom ? (
                      <TimelineInteraction
                        key={event.id}
                        event={event}
                        onUpdate={handleTimelineUpdate}
                        onDelete={handleTimelineDelete}
                      />
                    ) : (
                      <TimelineStep
                        key={event.id}
                        event={event}
                        onToggle={(checked) =>
                          handleToggleStep(event.id, checked)
                        }
                        onDateChange={(date) =>
                          handleTimelineUpdate({ ...event, date: date || null })
                        }
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="interaction">
                Añadir Interacción Personalizada
              </Label>
              <div className="flex gap-2">
                <Input
                  id="interaction"
                  value={newInteractionNote}
                  onChange={(e) => setNewInteractionNote(e.target.value)}
                  placeholder="Ej: Llamada de seguimiento..."
                />
                <Button variant="outline" onClick={handleAddInteraction}>
                  Añadir
                </Button>
              </div>
            </div>
          </div>
          <SheetFooter>
            <div className="flex justify-between w-full">
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
                      <AlertDialogTitle>
                        ¿Estás absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente el espectáculo y todos sus datos
                        asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <div></div>
              )}
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleCloseAttempt(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Guardar</Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres
              descartarlos y cerrar el panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              Descartar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatusBadge({
  show,
  onStatusChange,
}: {
  show: Show & { company?: Company };
  onStatusChange: (status: Show["status"]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            badgeVariants({ variant: statusColors[show.status] || "outline" }),
            "hover:opacity-80"
          )}
        >
          {show.status}
          <ChevronDown className="ml-1 h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuRadioGroup
          value={show.status}
          onValueChange={(value) => onStatusChange(value as Show["status"])}
        >
          {statusOptions.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CompanyDetailsDialog({ company }: { company: Company }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{company.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{company.contactName}</span>
        </div>
        <div className="flex items-center gap-4">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a
            href={`mailto:${company.contactEmail}`}
            className="text-primary hover:underline"
          >
            {company.contactEmail}
          </a>
        </div>
        {company.contactPhone && (
          <div className="flex items-center gap-4">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{company.contactPhone}</span>
          </div>
        )}
        {company.instagram && (
          <div className="flex items-center gap-4">
            <Instagram className="h-4 w-4 text-muted-foreground" />
            <a
              href={`https://instagram.com/${company.instagram.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {company.instagram}
            </a>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-4">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {company.website}
            </a>
          </div>
        )}
        <div className="flex items-center gap-4">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span>{company.type}</span>
        </div>
      </div>
    </DialogContent>
  );
}

function ProposalDialog({ show }: { show: Show & { company?: Company } }) {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Detalles de la Propuesta
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {/* Company Information */}
        {show.company && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">
              Información de la Compañía
            </h3>
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Nombre de la compañía
                </Label>
                <p className="font-medium">{show.company.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Persona de contacto
                </Label>
                <p className="font-medium">{show.company.contactName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <a
                  href={`mailto:${show.company.contactEmail}`}
                  className="font-medium text-primary hover:underline"
                >
                  {show.company.contactEmail}
                </a>
              </div>
              {show.company.contactPhone && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Teléfono
                  </Label>
                  <p className="font-medium">{show.company.contactPhone}</p>
                </div>
              )}
              {show.company.instagram && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Instagram
                  </Label>
                  <a
                    href={`https://instagram.com/${show.company.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {show.company.instagram}
                  </a>
                </div>
              )}
              {show.company.website && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Página Web
                  </Label>
                  <a
                    href={show.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {show.company.website}
                  </a>
                </div>
              )}
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <p className="font-medium">{show.company.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">
            Información del Espectáculo
          </h3>
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">
                Título del espectáculo
              </Label>
              <p className="font-medium text-lg">{show.title}</p>
            </div>
            {show.description && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Descripción / Sinopsis
                </Label>
                <p className="text-sm whitespace-pre-wrap">
                  {show.description}
                </p>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-4">
              {show.duration && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Durada (min)
                  </Label>
                  <p className="font-medium">{show.duration}</p>
                </div>
              )}
              {show.price && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Proposta de PREU
                  </Label>
                  <p className="font-medium">{show.price}</p>
                </div>
              )}
              {show.castSize && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Nº actores/actrices + técnicos
                  </Label>
                  <p className="font-medium">{show.castSize}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

function AllProposalsDialog({
  shows,
}: {
  shows: (Show & { company?: Company })[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<
    (Show & { company?: Company }) | null
  >(null);
  const proposals = shows.filter((show) => show.status === "Proposta Pendent");

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Ver Propuestas
            {proposals.length > 0 && (
              <Badge variant="warning" className="ml-auto">
                {proposals.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Listado de Propuestas Recibidas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay propuestas recibidas</p>
              </div>
            ) : (
              proposals.map((show) => (
                <Card
                  key={show.id}
                  className="border-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => {
                    setSelectedProposal(show);
                    setOpen(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {show.title}
                        </h4>
                        {show.company && (
                          <p className="text-sm text-muted-foreground">
                            {show.company.name} • {show.company.contactName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Pendiente</Badge>
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedProposal}
        onOpenChange={(open) => {
          if (!open) setSelectedProposal(null);
        }}
      >
        {selectedProposal && (
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles de la Propuesta
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Company Information */}
              {selectedProposal.company && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    Información de la Compañía
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Nombre de la compañía
                      </Label>
                      <p className="font-medium">
                        {selectedProposal.company.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Persona de contacto
                      </Label>
                      <p className="font-medium">
                        {selectedProposal.company.contactName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <a
                        href={`mailto:${selectedProposal.company.contactEmail}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {selectedProposal.company.contactEmail}
                      </a>
                    </div>
                    {selectedProposal.company.contactPhone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Teléfono
                        </Label>
                        <p className="font-medium">
                          {selectedProposal.company.contactPhone}
                        </p>
                      </div>
                    )}
                    {selectedProposal.company.instagram && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Instagram
                        </Label>
                        <a
                          href={`https://instagram.com/${selectedProposal.company.instagram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {selectedProposal.company.instagram}
                        </a>
                      </div>
                    )}
                    {selectedProposal.company.website && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Página Web
                        </Label>
                        <a
                          href={selectedProposal.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {selectedProposal.company.website}
                        </a>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Tipo
                      </Label>
                      <p className="font-medium">
                        {selectedProposal.company.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  Información del Espectáculo
                </h3>
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Título del espectáculo
                    </Label>
                    <p className="font-medium text-lg">
                      {selectedProposal.title}
                    </p>
                  </div>
                  {selectedProposal.description && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Descripción / Sinopsis
                      </Label>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedProposal.description}
                      </p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedProposal.duration && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Durada (min)
                        </Label>
                        <p className="font-medium">
                          {selectedProposal.duration}
                        </p>
                      </div>
                    )}
                    {selectedProposal.price && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Proposta de PREU
                        </Label>
                        <p className="font-medium">{selectedProposal.price}</p>
                      </div>
                    )}
                    {selectedProposal.castSize && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Nº actores/actrices + técnicos
                        </Label>
                        <p className="font-medium">
                          {selectedProposal.castSize}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default function ProgrammingClient() {
  const [shows, setShows] = useState<(Show & { company?: Company })[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<
    (Show & { company?: Company }) | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState<Show["status"] | "all">(
    "all"
  );
  const [showArchived, setShowArchived] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const router = useRouter();

  const companiesQuery = useMemoFirebase(
    () => (db ? collection(db, "companies") : null),
    [db]
  );
  const { data: companies } = useCollection<Company>(companiesQuery);

  const showsQuery = useMemoFirebase(
    () => (db ? collection(db, "shows") : null),
    [db]
  );
  const { data: fetchedShows } = useCollection<Show>(showsQuery);

  useEffect(() => {
    if (fetchedShows && companies) {
      const populatedShows = fetchedShows.map((show) => {
        const company = companies.find((c) => c.id === show.companyId);
        const timelineWithDates = (show.timeline || []).map((i: any) => ({
          ...i,
          date:
            i.date instanceof Timestamp
              ? i.date.toDate()
              : i.date
              ? new Date(i.date)
              : null,
        }));
        return { ...show, company, timeline: timelineWithDates };
      });
      setShows(populatedShows);
    }
  }, [fetchedShows, companies]);

  const filteredShows = useMemo(() => {
    return (shows || []).filter((show) => {
      if (!showArchived && show.status === "Archivado") {
        return false;
      }

      if (statusFilter !== "all" && show.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [shows, statusFilter, showArchived]);

  const handleSaveShow = (showData: Omit<Show, "id"> | Show) => {
    if (!db) return;
    const isNew = !("id" in showData);
    if (isNew) {
      addDoc(collection(db, "shows"), showData)
        .then(() =>
          toast({
            title: "Espectáculo añadido",
            description: `${showData.title} ha sido añadido.`,
          })
        )
        .catch((err) => {
          errorEmitter.emit(
            "permission-error",
            new FirestorePermissionError({
              path: "shows",
              operation: "create",
              requestResourceData: showData,
            })
          );
        });
    } else {
      const { id, company, ...dataToSave } = showData as Show & {
        company?: Company;
      };
      const docRef = doc(db, "shows", id);
      setDoc(docRef, dataToSave)
        .then(() =>
          toast({
            title: "Espectáculo actualizado",
            description: `${showData.title} ha sido actualizado.`,
          })
        )
        .catch((err) => {
          errorEmitter.emit(
            "permission-error",
            new FirestorePermissionError({
              path: docRef.path,
              operation: "update",
              requestResourceData: dataToSave,
            })
          );
        });
    }
  };

  const handleStatusChange = (show: Show, newStatus: Show["status"]) => {
    const updatedShow = { ...show, status: newStatus };
    handleSaveShow(updatedShow);
  };

  const handleDeleteShow = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "shows", id);
    deleteDoc(docRef)
      .then(() =>
        toast({
          title: "Espectáculo eliminado",
          description: "El espectáculo ha sido eliminado.",
        })
      )
      .catch((err) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: docRef.path,
            operation: "delete",
          })
        );
      });
  };

  const handleRowClick = (show: Show & { company?: Company }) => {
    setSelectedShow(show);
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setSelectedShow(undefined);
    setIsSheetOpen(true);
  };

  const handleScheduleShow = (show: Show) => {
    router.push(
      `/dashboard/calendar?scheduleShow=${encodeURIComponent(show.title)}`
    );
  };

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
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderShowItems()}</TableBody>
        </Table>
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className="space-y-3">{renderShowItems()}</div>
  );

  const renderShowItems = () => {
    return filteredShows.map((show) => {
      const lastInteraction =
        show.timeline && show.timeline.length > 0
          ? [...show.timeline]
              .filter((t) => t.date)
              .sort((a, b) => b.date!.getTime() - a.date!.getTime())[0]
          : null;

      const lastInteractionNote = lastInteraction?.isCustom
        ? lastInteraction.notes
        : lastInteraction?.name;

      const completedSteps = show.timeline
        ? show.timeline.filter((t) => !t.isCustom && t.date).length
        : 0;
      const progress = (completedSteps / FIXED_STEPS.length) * 100;

      if (isMobile) {
        return (
          <Card key={show.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className="font-semibold cursor-pointer"
                    onClick={() => handleRowClick(show)}
                  >
                    {show.title}
                  </p>
                  {show.company && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:underline">
                          {show.company.name}
                        </p>
                      </DialogTrigger>
                      <CompanyDetailsDialog company={show.company} />
                    </Dialog>
                  )}
                </div>
                <StatusBadge
                  show={show}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(show, newStatus)
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-full h-2" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              {lastInteraction && (
                <div className="text-sm text-muted-foreground">
                  <span>Última Interacción: </span>
                  <span className="font-medium">
                    {format(lastInteraction.date!, "d MMM, yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              )}
              {show.status === "Confirmado" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleScheduleShow(show)}
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Programar
                </Button>
              )}
              {show.status === "Proposta Pendent" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Propuesta
                    </Button>
                  </DialogTrigger>
                  <ProposalDialog show={show} />
                </Dialog>
              )}
            </CardContent>
          </Card>
        );
      }

      return (
        <TableRow key={show.id}>
          <TableCell className="font-medium">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => handleRowClick(show)}
            >
              {show.title}
            </span>
          </TableCell>
          <TableCell>
            {show.company && (
              <Dialog>
                <DialogTrigger asChild>
                  <span className="cursor-pointer hover:underline">
                    {show.company.name}
                  </span>
                </DialogTrigger>
                <CompanyDetailsDialog company={show.company} />
              </Dialog>
            )}
          </TableCell>
          <TableCell>
            <StatusBadge
              show={show}
              onStatusChange={(newStatus) =>
                handleStatusChange(show, newStatus)
              }
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-xs text-muted-foreground font-medium">
                {Math.round(progress)}%
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {lastInteraction?.date && (
                <span>
                  {format(lastInteraction.date, "d MMM, yyyy", { locale: es })}
                </span>
              )}
              {lastInteractionNote && (
                <Badge
                  variant="outline"
                  className="font-normal truncate max-w-xs"
                >
                  {lastInteractionNote}
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">
            {show.status === "Confirmado" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScheduleShow(show)}
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Programar
              </Button>
            )}
            {show.status === "Proposta Pendent" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Propuesta
                  </Button>
                </DialogTrigger>
                <ProposalDialog show={show} />
              </Dialog>
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Dialog>
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background p-4 space-y-2 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
              Acciones
            </h3>

            <Button onClick={handleAddNew} className="w-full justify-start">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Espectáculo
            </Button>

            <AllProposalsDialog shows={shows} />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
              Filtros
            </h3>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: Show["status"] | "all") =>
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-archived"
                  checked={showArchived}
                  onCheckedChange={(checked) => setShowArchived(!!checked)}
                />
                <label
                  htmlFor="show-archived"
                  className="text-sm leading-none cursor-pointer"
                >
                  Mostrar archivados
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:px-6">
          <AddEditShowSheet
            show={selectedShow}
            companies={companies || []}
            onSave={handleSaveShow}
            onDelete={handleDeleteShow}
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
          >
            <div></div>
          </AddEditShowSheet>

          {isMobile ? renderMobileView() : renderDesktopView()}
        </main>
      </div>
    </Dialog>
  );
}
