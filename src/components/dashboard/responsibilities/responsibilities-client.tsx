"use client";

import { useState } from "react";
import type { Responsibility as ResponsibilityType, TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bot } from "lucide-react";
import ResponsibilityCard from "./responsibility-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { assignResponsibility } from "@/ai/flows/assign-responsibilities";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamMembers as allTeamMembers } from "@/lib/data";

type ResponsibilitiesClientProps = {
  initialResponsibilities: ResponsibilityType[];
  teamMembers: TeamMember[];
};

function AddResponsibilityDialog({
  teamMembers,
  onAdd,
}: {
  teamMembers: TeamMember[];
  onAdd: (newResp: ResponsibilityType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [responsibility, setResponsibility] = useState("");
  const [suggestion, setSuggestion] = useState<{ member: string, reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<TeamMember | null>(null);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    if (!responsibility) {
      toast({
        title: "Error",
        description: "Por favor, introduce una descripción de la responsabilidad.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await assignResponsibility({
        responsibility,
        teamMembers,
      });
      setSuggestion({ member: result.suggestedTeamMember, reason: result.reasoning });
      const suggestedMember = allTeamMembers.find(m => m.name === result.suggestedTeamMember);
      if (suggestedMember) setSelectedAssignee(suggestedMember);
    } catch (error) {
      console.error(error);
      toast({
        title: "Sugerencia de IA fallida",
        description: "No se pudo obtener una sugerencia de la IA. Por favor, asigna manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddResponsibility = () => {
    if (!responsibility || !selectedAssignee) {
        toast({ title: "Información Faltante", description: "Por favor, proporciona una responsabilidad y selecciona un asignado.", variant: "destructive"});
        return;
    }
    const newResponsibility: ResponsibilityType = {
        id: `resp${Date.now()}`,
        title: responsibility,
        assignee: selectedAssignee,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Por defecto 2 semanas
        completed: false,
        subtasks: []
    }
    onAdd(newResponsibility);
    setOpen(false);
    setResponsibility("");
    setSuggestion(null);
    setSelectedAssignee(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Responsabilidad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Responsabilidad</DialogTitle>
          <DialogDescription>
            Describe la nueva tarea y obtén una sugerencia de IA para el mejor asignado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="responsibility">Responsabilidad</Label>
            <Input
              id="responsibility"
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              placeholder="p. ej., 'Organizar el festival de verano'"
            />
          </div>
          <Button variant="outline" onClick={handleGetSuggestion} disabled={isLoading}>
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? "Analizando..." : "Obtener Sugerencia de IA"}
          </Button>
          {isLoading && <Skeleton className="h-16 w-full" />}
          {suggestion && (
            <div className="p-3 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold flex items-center gap-2"><Bot className="h-4 w-4" /> Sugerencia de IA</h4>
                <p className="text-sm mt-1">
                    Asignar a <strong>{suggestion.member}</strong>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    <strong>Razonamiento:</strong> {suggestion.reason}
                </p>
            </div>
          )}
           <div className="grid gap-2">
                <Label htmlFor="assignee">Asignado</Label>
                <Select
                    value={selectedAssignee?.id}
                    onValueChange={(value) => {
                        const member = allTeamMembers.find(m => m.id === value);
                        setSelectedAssignee(member || null);
                    }}
                >
                    <SelectTrigger id="assignee">
                        <SelectValue placeholder="Seleccionar un asignado" />
                    </SelectTrigger>
                    <SelectContent>
                        {allTeamMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddResponsibility}>Añadir Responsabilidad</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ResponsibilitiesClient({
  initialResponsibilities,
  teamMembers,
}: ResponsibilitiesClientProps) {
  const [responsibilities, setResponsibilities] = useState<ResponsibilityType[]>(
    initialResponsibilities
  );

  const handleAddResponsibility = (newResp: ResponsibilityType) => {
    setResponsibilities(prev => [newResp, ...prev]);
  }

  const handleUpdate = (updatedResp: ResponsibilityType) => {
    setResponsibilities(
      responsibilities.map((r) => (r.id === updatedResp.id ? updatedResp : r))
    );
  };
  
  const handleDelete = (id: string) => {
    setResponsibilities(responsibilities.filter(r => r.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddResponsibilityDialog teamMembers={teamMembers} onAdd={handleAddResponsibility} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {responsibilities.map((resp) => (
          <ResponsibilityCard key={resp.id} responsibility={resp} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
