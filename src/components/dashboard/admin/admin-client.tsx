"use client";

import { useState, useEffect } from 'react';
import type { TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getFunctions, httpsCallable } from 'firebase/functions';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuth } from 'firebase/auth';


const roleColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Administrador': 'default',
    'Técnico': 'secondary',
    'Usuario': 'outline',
}

function Icon({ name }: { name: string }) {
    const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
    if (!IconComponent) return <LucideIcons.User className="h-5 w-5" />;
    return <IconComponent className="h-5 w-5" />;
}

export default function AdminClient() {
  const { toast } = useToast();
  const db = useFirestore();
  const functions = getFunctions();
  const auth = getAuth();

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'teamMembers');
  }, [db]);

  const { data: members, isLoading } = useCollection<TeamMember>(membersQuery);
  const [teamMembers, setTeamMembers] = useState<(TeamMember & { isTeamAdmin?: boolean })[]>([]);

  useEffect(() => {
    if (members) {
      const updatedMembers = members.map(m => ({ ...m, isTeamAdmin: false }));
      setTeamMembers(updatedMembers);
    }
  }, [members]);

  const setTeamAdminClaim = httpsCallable(functions, 'setTeamAdminClaim');

  const handleAdminToggle = async (memberId: string, isAdmin: boolean) => {
    
    const originalState = [...teamMembers];
    // Optimistic update
    setTeamMembers(prevMembers => prevMembers.map(m => m.id === memberId ? { ...m, isTeamAdmin: isAdmin } : m));

    try {
      await setTeamAdminClaim({ userId: memberId, isAdmin });
      toast({
        title: "Rol actualizado",
        description: `El rol de administrador de equipo ha sido ${isAdmin ? 'asignado' : 'revocado'}.`,
      });
      // Force refresh token to get new claims
      await auth.currentUser?.getIdToken(true);
    } catch (error) {
      console.error("Error updating admin role:", error);
      // Revert optimistic update on error
      setTeamMembers(originalState);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol de administrador de equipo.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Admin de Equipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(teamMembers || []).map((member) => {
            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 text-white" style={{ backgroundColor: member.avatar.color }}>
                      <AvatarFallback className="bg-transparent">
                        {member.avatar?.icon ? <Icon name={member.avatar.icon} /> : member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleColors[member.role] || 'outline'}>{member.role}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Label htmlFor={`admin-switch-${member.id}`} className='flex items-center gap-2'>
                        <Shield className="h-4 w-4 text-muted-foreground"/>
                        <span>Team Admin</span>
                    </Label>
                    <Switch
                        id={`admin-switch-${member.id}`}
                        checked={member.isTeamAdmin}
                        onCheckedChange={(checked) => handleAdminToggle(member.id, checked)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

