import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export async function initializeFirebase(config: FirebaseConfig) {
  if (app) {
    throw new Error('Firebase already initialized');
  }
  try {
    const { initializeApp } = await import('firebase/app') as typeof import('firebase/app');
    const { getAuth } = await import('firebase/auth') as typeof import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore') as typeof import('firebase/firestore');

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    throw new Error('Firebase is not installed. Please install firebase package to use auth features.');
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return db;
}