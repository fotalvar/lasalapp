"use client";
import { Responsibility as ResponsibilityType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format, formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ResponsibilityCardProps = {
  responsibility: ResponsibilityType;
  onUpdate: (responsibility: ResponsibilityType) => void;
  onDelete: (id: string) => void;
};

export default function ResponsibilityCard({ responsibility, onUpdate, onDelete }: ResponsibilityCardProps) {
  const { title, assignee, deadline, subtasks, completed } = responsibility;
  const userImage = PlaceHolderImages.find((img) => img.id === assignee.avatar);

  const completedSubtasks = subtasks.filter((task) => task.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : (completed ? 100 : 0);

  const handleSubtaskChange = (taskId: string, isChecked: boolean) => {
    const updatedSubtasks = subtasks.map(task => 
      task.id === taskId ? { ...task, completed: isChecked } : task
    );
    onUpdate({ ...responsibility, subtasks: updatedSubtasks });
  };
  
  const handleToggleComplete = () => {
    onUpdate({ ...responsibility, completed: !completed });
  };

  return (
    <Card className={cn("flex flex-col", completed && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
            <span className={cn("text-lg", completed && "line-through text-muted-foreground")}>{title}</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleToggleComplete}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        <span>{completed ? 'Mark as Incomplete' : 'Mark as Complete'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(responsibility.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardTitle>
        <CardDescription
          className={cn(
            "text-sm",
            new Date() > deadline && !completed ? "text-destructive font-semibold" : ""
          )}
        >
          Due {formatDistanceToNow(deadline, { addSuffix: true })} ({format(deadline, "MMM d")})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {subtasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              <Checkbox
                id={task.id}
                checked={task.completed}
                onCheckedChange={(checked) => handleSubtaskChange(task.id, !!checked)}
                disabled={completed}
              />
              <label
                htmlFor={task.id}
                className={cn("text-sm", task.completed && "line-through text-muted-foreground")}
              >
                {task.text}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={userImage?.imageUrl} alt={assignee.name} data-ai-hint={userImage?.imageHint} />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{assignee.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
      </CardFooter>
    </Card>
  );
}
