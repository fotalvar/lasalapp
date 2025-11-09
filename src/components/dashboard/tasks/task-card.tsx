"use client";
import { CalendarEvent, TeamMember } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Theater,
  Megaphone,
  Ticket,
  Users,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

type TaskCardProps = {
  event: CalendarEvent;
  teamMembers: TeamMember[];
  onUpdate: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
};

const eventConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  "Publicaciones en redes": {
    icon: <Megaphone className="h-4 w-4" />,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  "Venta de entradas": {
    icon: <Ticket className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  Espectáculos: {
    icon: <Theater className="h-4 w-4" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  Reuniones: {
    icon: <Users className="h-4 w-4" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  Ensayos: {
    icon: <Music className="h-4 w-4" />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
};

function MemberIcon({
  member,
  className,
}: {
  member: TeamMember;
  className?: string;
}) {
  const IconComponent = (LucideIcons as any)[
    member.avatar.icon
  ] as React.ElementType;
  if (!IconComponent)
    return <LucideIcons.User className={cn("h-5 w-5", className)} />;
  return <IconComponent className={cn("h-5 w-5", className)} />;
}

export default function TaskCard({
  event,
  teamMembers,
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const { title, date, type, assigneeIds = [], completed = false } = event;
  const config = eventConfig[type];

  const assignedMembers = teamMembers.filter((m) => assigneeIds.includes(m.id));
  const isOverdue = new Date() > date && !completed;

  const handleToggleComplete = () => {
    onUpdate({ ...event, completed: !completed });
  };

  return (
    <Card className={cn("flex flex-col", completed && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                config.bgColor,
                config.color
              )}
            >
              {config.icon}
            </div>
            <span
              className={cn(
                "text-base",
                completed && "line-through text-muted-foreground"
              )}
            >
              {title}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>
                  {completed
                    ? "Marcar como Incompleta"
                    : "Marcar como Completa"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Borrar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
        <CardDescription
          className={cn(
            "text-sm ml-11",
            isOverdue ? "text-destructive font-semibold" : ""
          )}
        >
          {formatDistanceToNow(date, { addSuffix: true, locale: es })} ·{" "}
          {format(date, "d MMM, HH:mm", { locale: es })}h
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-sm text-muted-foreground">Tipo:</span>
            <span className="text-sm font-medium">{type}</span>
          </div>
          {assignedMembers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Responsables:
              </span>
              {assignedMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-1">
                  <Avatar
                    className="h-5 w-5 text-white"
                    style={{ backgroundColor: member.avatar.color }}
                  >
                    <AvatarFallback className="bg-transparent text-xs">
                      <MemberIcon member={member} className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {completed ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Completada</span>
            </div>
          ) : isOverdue ? (
            <div className="flex items-center gap-1 text-destructive">
              <span className="text-sm font-medium">Vencida</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-sm">Pendiente</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
