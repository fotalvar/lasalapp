'use client';
import { useEffect, useState } from 'react';
import { FirebaseProvider, initializeFirebase } from './';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({
  children,
}: Readonly<FirebaseClientProviderProps>) {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);

  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setFirebaseApp(firebaseApp);
    setAuth(auth);
    setFirestore(firestore);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
