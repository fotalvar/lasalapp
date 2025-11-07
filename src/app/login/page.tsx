
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );
}

const ADMIN_EMAILS = ['info@atresquarts.com', 'admin@atresquarts.com'];

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!auth || isUserLoading) return;
    
    // This is for when user is already signed in
    if (user) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        router.replace('/dashboard/select-user');
      } else {
        router.replace('/public');
      }
      return;
    }
    
    // This is for handling the result after redirect
    setIsRedirecting(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          if (result.user.email && ADMIN_EMAILS.includes(result.user.email)) {
            router.replace('/dashboard/select-user');
          } else {
            router.replace('/public');
          }
        } else {
          // No user, not a redirect back, stop loading.
          setIsRedirecting(false);
        }
      }).catch(error => {
        console.error("Error getting redirect result:", error);
        setIsRedirecting(false);
      });

  }, [user, isUserLoading, auth, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsRedirecting(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  if (isUserLoading || isRedirecting || user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="font-bold text-2xl">laSalapp</span>
        </div>
        <p className="text-muted-foreground mb-8">
          Portal de Acceso
        </p>
        <div className="space-y-4">
           <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
              <GoogleIcon />
              <span>Acceso de Administrador</span>
            </Button>
            <Button variant="secondary" className="w-full" size="lg" onClick={() => router.push('/public')}>
              Acceso Externo
            </Button>
        </div>
      </div>
    </div>
  );
}
