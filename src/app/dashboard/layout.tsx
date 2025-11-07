'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  Loader2,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/firebase';
import {
  TeamUserProvider,
  useTeamUser,
} from '@/context/team-user-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import * as LucideIcons from 'lucide-react';
import { signOut } from 'firebase/auth';
import type { TeamMember } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/firebase';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Principal' },
  { href: '/dashboard/programming', icon: Theater, label: 'Programación' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendario' },
  { href: '/dashboard/expenses', icon: Banknote, label: 'Gastos' },
  { href: '/dashboard/meetings', icon: BookUser, label: 'Reuniones' },
  {
    href: '/dashboard/tasks',
    icon: ListTodo,
    label: 'Tareas',
  },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin' },
];

const mobileNavItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Principal',
    color: 'text-blue-500',
  },
  {
    href: '/dashboard/programming',
    icon: Theater,
    label: 'Programación',
    color: 'text-rose-500',
  },
  {
    href: '/dashboard/calendar',
    icon: Calendar,
    label: 'Calendario',
    color: 'text-amber-500',
  },
  {
    href: '/dashboard/expenses',
    icon: Banknote,
    label: 'Gastos',
    color: 'text-emerald-500',
  },
  {
    href: '/dashboard/tasks',
    icon: ListTodo,
    label: 'Tareas',
    color: 'text-pink-500',
  },
];

function MemberIcon({ member, className }: { member: TeamMember, className?: string }) {
    const IconComponent = (LucideIcons as any)[member.avatar.icon] as React.ElementType;
    if (!IconComponent) return <LucideIcons.User className={cn("h-5 w-5", className)} />;
    return <IconComponent className={cn("h-5 w-5", className)} />;
}

function UserMenu() {
  const { user } = useUser();
  const { selectedTeamUser } = useTeamUser();
  const router = useRouter();
  const auth = useAuth();
  
  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!selectedTeamUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8 text-white" style={{ backgroundColor: selectedTeamUser.avatar.color }}>
              <AvatarFallback className="bg-transparent">
                  <MemberIcon member={selectedTeamUser} className="h-4 w-4" />
              </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-left">{selectedTeamUser.name}</p>
            <p className='text-xs text-muted-foreground text-left'>Viendo como</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='w-56'>
        <DropdownMenuLabel>
            <p>Sesión iniciada como</p>
            <p className='font-normal text-muted-foreground'>{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/select-user')}>
          <Users className="mr-2 h-4 w-4" />
          <span>Cambiar de usuario</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className='text-destructive'>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex gap-2 items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.href}>
            <Button variant={isActive ? 'secondary' : 'ghost'} size="sm">
              <item.icon className="h-5 w-5 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNavBar() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex h-16 items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-full w-full flex-col items-center justify-center gap-1 text-xs transition-colors',
                      !isActive && 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon
                      className={cn('h-6 w-6', isActive ? item.color : '')}
                    />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}

const ADMIN_EMAILS = ['info@atresquarts.com', 'admin@atresquarts.com'];

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedTeamUser, isLoading: isTeamUserLoading } = useTeamUser();

  useEffect(() => {
    if (isUserLoading) return; // Wait until Firebase user state is determined
    if (!user || (user.email && !ADMIN_EMAILS.includes(user.email))) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

   useEffect(() => {
    // Don't run this check on the selection page itself
    if (pathname === '/dashboard/select-user' || isUserLoading || isTeamUserLoading) return;

    if (!selectedTeamUser) {
      router.replace('/dashboard/select-user');
    }
  }, [selectedTeamUser, isTeamUserLoading, isUserLoading, router, pathname]);

  if (isUserLoading || !user || (user.email && !ADMIN_EMAILS.includes(user.email)) || (!isTeamUserLoading && !selectedTeamUser && pathname !== '/dashboard/select-user')) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="mt-2 text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }
  
  if (pathname === '/dashboard/select-user' || pathname === '/dashboard/admin') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-background pb-16 md:pb-0">
      <header className="flex h-[60px] items-center justify-between border-b bg-background sticky top-0 z-40 px-4 lg:px-6">
        <DesktopNav />
        <div className="md:ml-auto">
          <UserMenu />
        </div>
      </header>
      <div className="flex flex-col">{children}</div>
      <BottomNavBar />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TeamUserProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </TeamUserProvider>
    )
}
