import { getFirebase } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";

export type SimpleUser = {
  uid: string;
  name: string;
  photoUrl: string | null;
};

function toSimpleUser(user: User | null): SimpleUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName || "小朋友",
    photoUrl: user.photoURL || null
  };
}

export function listenUser(callback: (user: SimpleUser | null) => void) {
  const { auth } = getFirebase();
  if (!auth || typeof window === "undefined") {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (u) => {
    callback(toSimpleUser(u));
  });
}

export async function signInWithGoogle(): Promise<SimpleUser | null> {
  const { auth } = getFirebase();
  if (!auth || typeof window === "undefined") return null;
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return toSimpleUser(result.user ?? null);
}

export async function signOutGoogle(): Promise<void> {
  const { auth } = getFirebase();
  if (!auth) return;
  await signOut(auth);
}


