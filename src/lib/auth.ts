import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  doc, setDoc, getDoc, serverTimestamp,
  collection, getCountFromServer
} from "firebase/firestore";
import { UserProfile } from "../types/auth";

export function watchAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  // Si es el primer usuario del sistema => hazlo super_admin
  const countSnap = await getCountFromServer(collection(db, "users"));
  const isFirstUser = countSnap.data().count === 0;

  const profile: UserProfile = {
    role: isFirstUser ? "super_admin" : "admin", // puedes cambiar "admin" a "propietario" si prefieres
    tenants: [], // luego agregaremos el/los tenant_id
    email: user.email || undefined,
    displayName: user.displayName || undefined,
    created_at: serverTimestamp()
  };
  await setDoc(ref, profile);
}

export async function signUpEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function signOutApp() {
  await signOut(auth);
}

