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

const GhostIcon = () => (
    <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-14 w-auto">
        <path d="M49.254 13.333C43.336 13.333 39.807 15.26 37.333 18.042C34.86 15.26 31.33 13.333 25.414 13.333C18.665 13.333 13.333 19.333 13.333 26.833C13.333 36.541 23.253 44.027 37.333 55.416C51.413 44.027 61.333 36.541 61.333 26.833C61.333 19.333 55.941 13.333 49.254 13.333Z" fill="hsl(var(--primary))"/>
    </svg>
);

function AppLogo() {
  return (
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M57.1755 0.999982C57.1755 0.999982 43.1595 1.00002 38.0475 1C31.5275 0.999979 26.8435 6.43198 26.8435 12.992C26.8435 19.552 30.5595 24.38 35.1995 26.936C35.1995 26.936 31.4235 30.488 28.5115 33.164C21.9755 39.116 14.1595 48.068 14.1595 62.9C14.1595 81.332 29.5675 99 50.7195 99C71.8715 99 87.2795 81.332 87.2795 62.9C87.2795 44.468 64.9275 14.42 57.1755 0.999982Z" fill="#F5F5F5"/>
        <path d="M50.7197 99C29.5677 99 14.1597 81.332 14.1597 62.9C14.1597 48.068 21.9757 39.116 28.5117 33.164L28.7197 32.96C31.6317 30.284 35.1997 26.936 35.1997 26.936C30.5597 24.38 26.8437 19.552 26.8437 12.992C26.8437 6.43198 31.5277 0.999979 38.0477 1C43.1597 1.00002 57.1757 0.999982 57.1757 0.999982C64.9277 14.42 87.2797 44.468 87.2797 62.9C87.2797 81.332 71.8717 99 50.7197 99Z" stroke="#1C1C1C" strokeWidth="2"/>
        <path d="M47.7887 31.848C47.7887 31.848 48.6527 34.056 46.4447 34.608C44.2367 35.16 41.7407 33.768 41.7407 33.768" stroke="#1C1C1C" strokeWidth="2"/>
        <path d="M59.3957 31.848C59.3957 31.848 58.5317 34.056 60.7397 34.608C62.9477 35.16 65.4437 33.768 65.4437 33.768" stroke="#1C1C1C" strokeWidth="2"/>
        <path d="M53.8828 41.832C53.3308 43.176 52.1548 44.232 50.7188 44.232C49.2828 44.232 48.1068 43.176 47.5548 41.832" stroke="#1C1C1C" strokeWidth="2"/>
        <path d="M28.5117 76.812C28.5117 76.812 40.6397 84.888 56.8877 75.468C66.5277 69.852 69.4397 59.94 69.4397 59.94" stroke="#1C1C1C" strokeWidth="2"/>
    </svg>
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
      <header className="flex h-14 items-center justify-between gap-4 border-b bg-background lg:h-[60px] sticky top-0 z-40 pr-4 lg:pr-6">
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
