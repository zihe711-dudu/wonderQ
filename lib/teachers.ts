import { getFirebase } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function isTeacher(uid: string): Promise<boolean> {
  const { db } = getFirebase();
  if (!db || !uid) return false;
  try {
    const ref = doc(db, "teachers", uid);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch {
    return false;
  }
}


