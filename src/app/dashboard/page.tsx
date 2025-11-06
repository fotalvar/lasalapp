'use client';

import {
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  {
    href: '/dashboard/team',
    icon: Users,
    label: 'Equipo',
    color: 'text-sky-500',
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
    href: '/dashboard/meetings',
    icon: BookUser,
    label: 'Reuniones',
    color: 'text-indigo-500',
  },
  {
    href: '/dashboard/tasks',
    icon: ListTodo,
    label: 'Tareas',
    color: 'text-pink-500',
  },
];

export default function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex-1">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Panel Principal</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="flex flex-col items-center justify-center text-center p-4">
                  <item.icon className={cn('h-8 w-8 mb-2', item.color)} />
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </main>
    </div>
  );
}
