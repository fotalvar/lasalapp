"use client";

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, FilePenLine, Trash2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Director': 'default',
    'Producer': 'secondary',
    'Technician': 'outline',
    'Marketing': 'default',
    'Admin': 'secondary',
}

function AddEditMemberDialog({ member, onSave, children }: { member?: TeamMember, onSave: (member: TeamMember) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(member?.name || '');
    const [email, setEmail] = useState(member?.email || '');
    const [role, setRole] = useState<TeamMember['role'] | undefined>(member?.role);

    const handleSave = () => {
        if (!name || !email || !role) return;
        const newMember: TeamMember = {
            id: member?.id || `member-${Date.now()}`,
            name,
            email,
            role,
            avatar: member?.avatar || `user-avatar-${Math.ceil(Math.random() * 5)}`,
            currentTasks: member?.currentTasks || [],
            upcomingDeadlines: member?.upcomingDeadlines || []
        };
        onSave(newMember);
        setOpen(false);
        if (!member) {
            setName('');
            setEmail('');
            setRole(undefined);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{member ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                    <DialogDescription>
                        {member ? 'Update the details for this team member.' : 'Add a new member to your team.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value: TeamMember['role']) => setRole(value)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="Producer">Producer</SelectItem>
                                <SelectItem value="Technician">Technician</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function TeamClient({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState(initialMembers);

  const handleSaveMember = (member: TeamMember) => {
    setMembers(prev => {
        const existing = prev.find(m => m.id === member.id);
        if (existing) {
            return prev.map(m => m.id === member.id ? member : m);
        }
        return [member, ...prev];
    })
  }
  
  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <AddEditMemberDialog onSave={handleSaveMember}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
            </Button>
        </AddEditMemberDialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Current Tasks</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const userImage = PlaceHolderImages.find((img) => img.id === member.avatar);
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={userImage?.imageUrl} data-ai-hint={userImage?.imageHint} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
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
                  <TableCell className="hidden md:table-cell">
                    {member.currentTasks.join(', ')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <AddEditMemberDialog member={member} onSave={handleSaveMember}>
                            <button className='relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full'>
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Edit
                            </button>
                        </AddEditMemberDialog>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
