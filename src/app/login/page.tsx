
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Loader2, Theater } from 'lucide-react';

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

  const handleRedirect = (user: User | null) => {
    if (!user) return;
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      router.replace('/dashboard');
    } else {
      router.replace('/public');
    }
  };

  useEffect(() => {
    if (!isUserLoading && user) {
      handleRedirect(user);
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Redirection is handled by the useEffect hook
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  if (isUserLoading || user) {
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
          <svg
            width="60"
            height="60"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M57.1755 0.999982C57.1755 0.999982 43.1595 1.00002 38.0475 1C31.5275 0.999968 25.4955 3.32798 25.4955 11.724C25.4955 20.12 31.0395 24.504 38.0475 24.504C45.0555 24.504 57.1755 20.12 57.1755 11.724C57.1755 3.32798 57.1755 0.999982 57.1755 0.999982Z"
              fill="#F5F5F5"
              stroke="#1C1C1C"
              strokeWidth="2"
            />
            <path
              d="M50.7197 99C29.5677 99 14.1597 81.332 14.1597 62.9C14.1597 48.068 21.9757 34.608 34.9037 29.568C38.0157 28.224 43.1597 27.432 45.8637 28.224C47.8437 28.776 50.7197 30.12 50.7197 30.12L50.7197 29.568L58.2077 28.776L59.3957 29.568C72.3237 34.608 80.1397 48.068 80.1397 62.9C80.1397 81.332 64.9197 99 50.7197 99Z"
              fill="#F5F5F5"
            />
            <path
              d="M50.7197 99C29.5677 99 14.1597 81.332 14.1597 62.9C14.1597 48.068 21.9757 34.608 34.9037 29.568C38.0157 28.224 43.1597 27.432 45.8637 28.224C47.8437 28.776 50.7197 30.12 50.7197 30.12L50.7197 29.568L58.2077 28.776L59.3957 29.568C72.3237 34.608 80.1397 48.068 80.1397 62.9C80.1397 81.332 64.9197 99 50.7197 99Z"
              stroke="#1C1C1C"
              strokeWidth="2"
            />
            <path
              d="M47.7887 31.848C47.7887 31.848 48.6527 34.056 46.4447 34.608C44.2367 35.16 42.1487 34.056 42.1487 34.056"
              stroke="#1C1C1C"
              strokeWidth="2"
            />
            <path
              d="M59.3957 31.848C59.3957 31.848 58.5317 34.056 60.7397 34.608C62.9477 35.16 65.0357 34.056 65.0357 34.056"
              stroke="#1C1C1C"
              strokeWidth="2"
            />
            <path
              d="M53.8828 41.832C53.3308 43.176 52.1548 44.232 50.7188 44.232C49.2828 44.232 48.1068 43.176 47.5548 41.832"
              stroke="#1C1C1C"
              strokeWidth="2"
            />
            <path
              d="M28.5117 76.812C28.5117 76.812 40.6397 84.888 56.8877 75.468C66.5277 69.828 72.3237 60.132 72.3237 60.132"
              stroke="#1C1C1C"
              strokeWidth="2"
            />
          </svg>
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

    