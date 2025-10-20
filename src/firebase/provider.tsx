'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { initializeFirebase } from '@/firebase';

interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  isFirebaseLoading: boolean; // New state to track Firebase initialization
  error: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);
  const [userState, setUserState] = useState<{
    user: User | null;
    isUserLoading: boolean;
    error: Error | null;
  }>({
    user: null,
    isUserLoading: true,
    error: null,
  });

  const isFirebaseLoading = services === null;

  useEffect(() => {
    // Initialize Firebase on the client side, once per component mount.
    const firebaseServices = initializeFirebase();
    setServices(firebaseServices);
  }, []);

  useEffect(() => {
    if (!services) return;

    setUserState({ user: null, isUserLoading: true, error: null });

    const unsubscribe = onAuthStateChanged(
      services.auth,
      (firebaseUser) => {
        setUserState({ user: firebaseUser, isUserLoading: false, error: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserState({ user: null, isUserLoading: false, error: error });
      }
    );

    return () => unsubscribe();
  }, [services]);

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp: services?.firebaseApp || null,
    firestore: services?.firestore || null,
    auth: services?.auth || null,
    user: userState.user,
    isUserLoading: userState.isUserLoading,
    isFirebaseLoading,
    error: userState.error,
  }), [services, userState, isFirebaseLoading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useAuth = (): Auth => {
  const { auth, isFirebaseLoading } = useFirebase();
  if (isFirebaseLoading || !auth) {
    throw new Error('Firebase Auth not available yet. Ensure you are handling the loading state.');
  }
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore, isFirebaseLoading } = useFirebase();
  if (isFirebaseLoading || !firestore) {
    throw new Error('Firestore not available yet. Ensure you are handling the loading state.');
  }
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp, isFirebaseLoading } = useFirebase();
  if (isFirebaseLoading || !firebaseApp) {
    throw new Error('Firebase App not available yet. Ensure you are handling the loading state.');
  }
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = () => {
  const { user, isUserLoading, error } = useFirebase();
  return { user, isUserLoading, error };
};
