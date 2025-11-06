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

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Principal' },
  { href: '/dashboard/team', icon: Users, label: 'Equipo' },
  { href: '/dashboard/programming', icon: Theater, label: 'Programación' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendario' },
  { href: '/dashboard/expenses', icon: Banknote, label: 'Gastos' },
  { href: '/dashboard/meetings', icon: BookUser, label: 'Reuniones' },
  {
    href: '/dashboard/tasks',
    icon: ListTodo,
    label: 'Tareas',
  },
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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return; // Wait until user state is determined
    if (!user || (user.email && !ADMIN_EMAILS.includes(user.email))) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || (user.email && !ADMIN_EMAILS.includes(user.email))) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="mt-2 text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background pb-16 md:pb-0">
      <header className="hidden md:flex h-[60px] items-center justify-center gap-2 border-b bg-background sticky top-0 z-40 px-4 lg:px-6">
        <DesktopNav />
      </header>
      <div className="flex flex-col">{children}</div>
      <BottomNavBar />
    </div>
  );
}
