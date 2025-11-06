'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAILS = ['info@atresquarts.com', 'admin@atresquarts.com'];

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) return; // Wait for user status to be confirmed

    if (user) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        router.replace('/dashboard');
      } else {
        router.replace('/public');
      }
    } else {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
