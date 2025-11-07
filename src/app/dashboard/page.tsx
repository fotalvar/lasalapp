'use client';

import {
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  LogOut,
  Building,
  Clapperboard,
  Megaphone,
  Ticket,
  Music,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTeamUser } from '@/context/team-user-context';
import { useState, useEffect, useMemo } from 'react';
import type { TeamMember, CalendarEvent, Task } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import * as LucideIcons from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const navItems = [
  { href: '/dashboard/team', icon: Users, label: 'Equipo', color: 'text-sky-500' },
  { href: '/dashboard/companies', icon: Building, label: 'Compañías', color: 'text-purple-500' },
  { href: '/dashboard/programming', icon: Theater, label: 'Programación', color: 'text-rose-500' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendario', color: 'text-amber-500' },
  { href: '/dashboard/expenses', icon: Banknote, label: 'Gastos', color: 'text-emerald-500' },
  { href: '/dashboard/meetings', icon: BookUser, label: 'Reuniones', color: 'text-indigo-500' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tareas', color: 'text-pink-500' },
];

const eventIcons: { [key: string]: React.ElementType } = {
  'Espectáculos': Clapperboard,
  'Publicaciones en redes': Megaphone,
  'Venta de entradas': Ticket,
  'Reuniones': Users,
  'Ensayos': Music,
};


function TeamProgressWidget({ teamMembers, tasks }: { teamMembers: TeamMember[], tasks: Task[] }) {
    const memberProgress = useMemo(() => {
        return teamMembers.map(member => {
            const memberTasks = tasks.filter(task => task.assignee.id === member.id);
            if (memberTasks.length === 0) {
                return { ...member, progress: 100, taskCount: 0 };
            }
            const completedTasks = memberTasks.filter(task => task.completed).length;
            const progress = (completedTasks / memberTasks.length) * 100;
            return { ...member, progress, taskCount: memberTasks.length };
        });
    }, [teamMembers, tasks]);
    
    function MemberIcon({ member, className }: { member: TeamMember, className?: string }) {
        const IconComponent = (LucideIcons as any)[member.avatar.icon] as React.ElementType;
        if (!IconComponent) return <LucideIcons.User className={cn("h-5 w-5", className)} />;
        return <IconComponent className={cn("h-5 w-5", className)} />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progreso del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {memberProgress.map(member => (
                        <div key={member.id}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                     <Avatar className="h-6 w-6 text-white" style={{ backgroundColor: member.avatar.color }}>
                                        <AvatarFallback className="bg-transparent text-xs">
                                            <MemberIcon member={member} className="h-3 w-3" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{member.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{member.taskCount} tareas</span>
                            </div>
                            <Progress value={member.progress} className="h-2" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function MyTasksWidget({ events }: { events: CalendarEvent[] }) {
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Próximos Eventos</CardTitle>
                <CardDescription>Tus próximos 3 eventos asignados.</CardDescription>
            </CardHeader>
            <CardContent>
                 {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map(event => {
                           const Icon = eventIcons[event.type] || Calendar;
                           return (
                                <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg bg-background border">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(event.date, "eeee, d 'de' MMMM", { locale: es })}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No tienes eventos próximos.</p>
                 )}
            </CardContent>
        </Card>
    );
}


export default function DashboardPage() {
  const { selectedTeamUser } = useTeamUser();
  const db = useFirestore();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);

  // Fetch all team members
  const teamMembersQuery = useMemoFirebase(() => db ? collection(db, 'teamMembers') : null, [db]);
  const { data: fetchedMembers } = useCollection<TeamMember>(teamMembersQuery);
  
  // Fetch all tasks
  const tasksQuery = useMemoFirebase(() => db ? collection(db, 'tasks') : null, [db]);
  const { data: fetchedTasksFromDB } = useCollection<Task>(tasksQuery);
  
  // Fetch my upcoming events
  const myEventsQuery = useMemoFirebase(() => {
    if (!db || !selectedTeamUser) return null;
    return query(
        collection(db, 'events'),
        where('assigneeIds', 'array-contains', selectedTeamUser.id),
        where('date', '>=', new Date()),
        orderBy('date', 'asc'),
        limit(3)
    );
  }, [db, selectedTeamUser]);
  const { data: fetchedMyEvents } = useCollection<CalendarEvent>(myEventsQuery);
  
  useEffect(() => {
    if (fetchedMembers) setTeamMembers(fetchedMembers);
  }, [fetchedMembers]);

  useEffect(() => {
    if (fetchedTasksFromDB && teamMembers.length > 0) {
        const populatedTasks = fetchedTasksFromDB.map(task => {
            const assignee = teamMembers.find(m => m.id === (task.assignee as unknown as string));
            return assignee ? { ...task, assignee } : task;
        }).filter(t => t.assignee) as Task[];
        setTasks(populatedTasks);
    }
  }, [fetchedTasksFromDB, teamMembers]);

  useEffect(() => {
    if (fetchedMyEvents) {
        setMyEvents(fetchedMyEvents.map(e => ({...e, date: e.date instanceof Timestamp ? e.date.toDate() : e.date })))
    }
  }, [fetchedMyEvents]);

  return (
    <div className="flex-1">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {selectedTeamUser?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mb-6">¿Qué quieres gestionar hoy?</p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-center p-3 gap-2">
                  <item.icon className={cn('h-5 w-5', item.color)} />
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <MyTasksWidget events={myEvents} />
            <TeamProgressWidget teamMembers={teamMembers} tasks={tasks} />
        </div>
      </main>
    </div>
  );
}
