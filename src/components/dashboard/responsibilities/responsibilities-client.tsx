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
        description: "Please enter a responsibility description.",
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
        title: "AI Suggestion Failed",
        description: "Could not get a suggestion from the AI. Please assign manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddResponsibility = () => {
    if (!responsibility || !selectedAssignee) {
        toast({ title: "Missing Information", description: "Please provide a responsibility and select an assignee.", variant: "destructive"});
        return;
    }
    const newResponsibility: ResponsibilityType = {
        id: `resp${Date.now()}`,
        title: responsibility,
        assignee: selectedAssignee,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to 2 weeks
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
          Add Responsibility
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Responsibility</DialogTitle>
          <DialogDescription>
            Describe the new task and get an AI suggestion for the best assignee.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="responsibility">Responsibility</Label>
            <Input
              id="responsibility"
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              placeholder="e.g., 'Organize the summer festival'"
            />
          </div>
          <Button variant="outline" onClick={handleGetSuggestion} disabled={isLoading}>
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? "Analyzing..." : "Get AI Suggestion"}
          </Button>
          {isLoading && <Skeleton className="h-16 w-full" />}
          {suggestion && (
            <div className="p-3 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold flex items-center gap-2"><Bot className="h-4 w-4" /> AI Suggestion</h4>
                <p className="text-sm mt-1">
                    Assign to <strong>{suggestion.member}</strong>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    <strong>Reasoning:</strong> {suggestion.reason}
                </p>
            </div>
          )}
           <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                    value={selectedAssignee?.id}
                    onValueChange={(value) => {
                        const member = allTeamMembers.find(m => m.id === value);
                        setSelectedAssignee(member || null);
                    }}
                >
                    <SelectTrigger id="assignee">
                        <SelectValue placeholder="Select an assignee" />
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
          <Button onClick={handleAddResponsibility}>Add Responsibility</Button>
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
