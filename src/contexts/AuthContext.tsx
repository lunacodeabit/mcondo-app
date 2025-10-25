import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { watchAuth } from "../lib/auth";
import type { UserProfile } from "../types/auth";

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const Ctx = createContext<AuthState>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuth(async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", u.uid);
      const unsubProfile = onSnapshot(ref, (snap) => {
        setProfile((snap.exists() ? (snap.data() as UserProfile) : null));
        setLoading(false);
      });
      return () => unsubProfile();
    });
    return () => unsub();
  }, []);

  return <Ctx.Provider value={{ user, profile, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
