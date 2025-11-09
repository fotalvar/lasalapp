"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";

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

const ADMIN_EMAILS = ["info@atresquarts.com", "admin@atresquarts.com"];

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!auth || isUserLoading) return;

    // This is for when user is already signed in
    if (user) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        router.replace("/dashboard/select-user");
      } else {
        router.replace("/public");
      }
    }
  }, [user, isUserLoading, auth, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      logger.error("[Login] Auth is not initialized");
      return;
    }

    try {
      logger.debug("[Login] Starting Google sign in");
      setIsSigningIn(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      logger.info("[Login] Sign in successful", { email: result.user.email });

      // The useEffect will handle the redirect based on the user email
    } catch (error: any) {
      logger.error("[Login] Error during sign in", {
        code: error.code,
        message: error.message,
      });
      setIsSigningIn(false);
    }
  };

  if (isUserLoading || isSigningIn || user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center overflow-hidden p-4"
      style={{ backgroundColor: "#1C1C1C" }}
    >
      {/* Animated blur effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "400px",
            height: "400px",
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            opacity: 0.12,
            top: "10%",
            left: "10%",
            animation: "float 30s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "350px",
            height: "350px",
            background: "linear-gradient(45deg, #ec4899, #f43f5e)",
            opacity: 0.1,
            bottom: "15%",
            right: "15%",
            animation: "float 35s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "300px",
            height: "300px",
            background: "linear-gradient(45deg, #3b82f6, #06b6d4)",
            opacity: 0.08,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "float 40s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(15px, -15px) scale(1.02);
          }
          66% {
            transform: translate(-10px, 10px) scale(0.98);
          }
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Login Card with Border */}
        <div className="relative z-10 w-full max-w-md border-2 border-border rounded-lg bg-background p-8 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img src="/logo.png" alt="laSala" className="h-16 w-auto" />
            </div>
            <p className="text-muted-foreground mb-8">Portal de Acceso</p>
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full"
                size="lg"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Acceso de Administrador</span>
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => router.push("/public")}
                disabled={isSigningIn}
              >
                Acceso Externo
              </Button>
            </div>
          </div>
        </div>

        {/* Logo 2 protruding from right side */}
        <div
          className="absolute z-[11] hidden lg:block"
          style={{ right: "-5rem", top: "50%", transform: "translateY(-50%)" }}
        >
          <img src="/logo_2.png" alt="laSala" className="h-32 w-auto" />
        </div>
      </div>
    </div>
  );
}
