'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
