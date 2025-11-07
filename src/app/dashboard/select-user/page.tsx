'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { TeamMember } from '@/lib/types';
import { useTeamUser } from '@/context/team-user-context';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

function MemberIcon({ member, className }: { member: TeamMember, className?: string }) {
    const IconComponent = (LucideIcons as any)[member.avatar.icon] as React.ElementType;
    if (!IconComponent) return <LucideIcons.User className={cn("h-5 w-5", className)} />;
    return <IconComponent className={cn("h-5 w-5", className)} />;
}

export default function SelectUserPage() {
  const db = useFirestore();
  const { setSelectedTeamUser } = useTeamUser();
  const router = useRouter();

  const teamMembersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'teamMembers');
  }, [db]);

  const { data: teamMembers, isLoading } = useCollection<TeamMember>(teamMembersQuery);

  const handleSelectUser = (member: TeamMember) => {
    setSelectedTeamUser(member);
    router.replace('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-2">¿Quién está trabajando hoy?</h1>
        <p className="text-muted-foreground mb-8">
          Selecciona tu perfil para continuar al panel de gestión.
        </p>
        
        {isLoading ? (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(teamMembers || []).map(member => (
                    <Card 
                        key={member.id} 
                        onClick={() => handleSelectUser(member)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        <CardContent className="flex flex-col items-center justify-center p-4">
                            <Avatar className="h-20 w-20 text-white mb-4" style={{ backgroundColor: member.avatar.color }}>
                                <AvatarFallback className="bg-transparent text-4xl">
                                    <MemberIcon member={member} className="h-10 w-10" />
                                </AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
