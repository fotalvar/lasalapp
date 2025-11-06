'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  Film,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Principal' },
  { href: '/dashboard/team', icon: Users, label: 'Equipo' },
  { href: '/dashboard/programming', icon: Theater, label: 'Programación' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendario' },
  { href: '/dashboard/expenses', icon: Banknote, label: 'Gastos' },
  { href: '/dashboard/meetings', icon: BookUser, label: 'Reuniones' },
  { href: '/dashboard/responsibilities', icon: ListTodo, label: 'Responsabilidades' },
  { href: '/dashboard/productions', icon: Film, label: 'Producciones' },
  { href: '/dashboard/ideas', icon: Lightbulb, label: 'Ideas' },
];

const mobileNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Principal', color: 'text-blue-500' },
    { href: '/dashboard/programming', icon: Theater, label: 'Programación', color: 'text-rose-500' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Calendario', color: 'text-amber-500' },
    { href: '/dashboard/expenses', icon: Banknote, label: 'Gastos', color: 'text-emerald-500' },
    { href: '/dashboard/responsibilities', icon: ListTodo, label: 'Responsabilidades', color: 'text-pink-500' },
];

function AppLogo() {
  return (
    <div className="relative h-[60px] w-[60px]">
      <Image src="/logo.png" alt="laSalapp logo" fill style={{ objectFit: 'contain' }} />
    </div>
  )
}

function DesktopNav() {
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <nav className="hidden md:flex gap-2 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} size="icon">
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
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
                    <item.icon className={cn('h-6 w-6', isActive ? item.color : '')} />
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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background pb-16 md:pb-0">
      <header className="hidden md:flex h-[60px] items-center justify-between gap-2 border-b bg-background sticky top-0 z-40 pr-4 lg:pr-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <AppLogo />
          <span className="font-bold text-lg">laSalapp</span>
        </Link>
        <DesktopNav />
      </header>
      <div className="flex flex-col">{children}</div>
      <BottomNavBar />
    </div>
  );
}
