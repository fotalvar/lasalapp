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
import PageHeader from '@/components/dashboard/page-header';

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

function BottomNavBar() {
  const pathname = usePathname();

  const mainNavItems = navItems.filter((item) =>
    ['/dashboard', '/dashboard/team', '/dashboard/calendar', '/dashboard/productions'].includes(
      item.href
    )
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center justify-around">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentNavItem = navItems.find((item) => item.href === pathname);

  const showHeader = pathname !== '/dashboard';

  return (
    <div className="min-h-screen w-full bg-background pb-16">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Theater className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">laSalapp</span>
        </Link>
      </header>
      <div className="flex flex-col">{children}</div>
      <BottomNavBar />
    </div>
  );
}
