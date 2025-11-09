import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebase(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
} {
  if (app && db && auth) {
    return { app, db, auth };
  }

  if (
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    return { app: null, db: null, auth: null };
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  };

  const existingApp = getApps().length ? getApp() : initializeApp(config);
  app = existingApp;
  db = getFirestore(existingApp);
  auth = getAuth(existingApp);

  return { app, db, auth };
}



