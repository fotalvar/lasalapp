"use client";

import { useState } from "react";
import type { Task as TaskType, TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bot } from "lucide-react";
import TaskCard from "./task-card";
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
import { assignTask } from "@/ai/flows/assign-task";
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

type TasksClientProps = {
  initialTasks: TaskType[];
  teamMembers: TeamMember[];
};

function AddTaskSheet({
  teamMembers,
  onAdd,
}: {
  teamMembers: TeamMember[];
  onAdd: (newResp: TaskType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [suggestion, setSuggestion] = useState<{ member: string, reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<TeamMember | null>(null);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    if (!task) {
      toast({
        title: "Error",
        description: "Por favor, introduce una descripción de la tarea.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await assignTask({
        task,
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
  
  const handleAddTask = () => {
    if (!task || !selectedAssignee) {
        toast({ title: "Información Faltante", description: "Por favor, proporciona una tarea y selecciona un asignado.", variant: "destructive"});
        return;
    }
    const newTask: TaskType = {
        id: `task${Date.now()}`,
        title: task,
        assignee: selectedAssignee,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Por defecto 2 semanas
        completed: false,
        subtasks: []
    }
    onAdd(newTask);
    setOpen(false);
    setTask("");
    setSuggestion(null);
    setSelectedAssignee(null);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Tarea
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Añadir Nueva Tarea</SheetTitle>
          <SheetDescription>
            Describe la nueva tarea y obtén una sugerencia de IA para el mejor asignado.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task">Tarea</Label>
            <Input
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
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
        <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddTask}>Añadir Tarea</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function TasksClient({
  initialTasks,
  teamMembers,
}: TasksClientProps) {
  const [tasks, setTasks] = useState<TaskType[]>(
    initialTasks
  );

  const handleAddTask = (newResp: TaskType) => {
    setTasks(prev => [newResp, ...prev]);
  }

  const handleUpdate = (updatedResp: TaskType) => {
    setTasks(
      tasks.map((r) => (r.id === updatedResp.id ? updatedResp : r))
    );
  };
  
  const handleDelete = (id: string) => {
    setTasks(tasks.filter(r => r.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddTaskSheet teamMembers={teamMembers} onAdd={handleAddTask} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((resp) => (
          <TaskCard key={resp.id} task={resp} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
