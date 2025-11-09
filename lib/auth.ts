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
  // 避免連點造成多個 popup 競爭，導致 auth/cancelled-popup-request
  // 以單例 Promise 保證同時間只會有一個登入流程
  if ((window as any).__WONDERQ_SIGNIN_PROMISE__) {
    return (window as any).__WONDERQ_SIGNIN_PROMISE__;
  }
  const provider = new GoogleAuthProvider();
  const task: Promise<SimpleUser | null> = signInWithPopup(auth, provider)
    .then((result) => toSimpleUser(result.user ?? null))
    .catch(async (err: any) => {
      // 使用者關掉 popup 或被其他 popup 取消時，回傳目前已登入使用者（若有）
      if (err?.code === "auth/cancelled-popup-request" || err?.code === "auth/popup-closed-by-user") {
        return toSimpleUser(auth.currentUser ?? null);
      }
      throw err;
    })
    .finally(() => {
      (window as any).__WONDERQ_SIGNIN_PROMISE__ = null;
    });
  (window as any).__WONDERQ_SIGNIN_PROMISE__ = task;
  return task;
}

export async function signOutGoogle(): Promise<void> {
  const { auth } = getFirebase();
  if (!auth) return;
  await signOut(auth);
}


