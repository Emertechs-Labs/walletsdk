// Firebase type declarations for optional dependency
declare module 'firebase/app' {
  export interface FirebaseApp {
    // Add minimal interface for our needs
  }
  export function initializeApp(config: any): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface Auth {
    currentUser: any;
  }
  export interface User {
    uid: string;
    email: string | null;
    emailVerified: boolean;
  }
  export interface UserCredential {
    user: User;
  }
  export function getAuth(app?: any): Auth;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function onAuthStateChanged(auth: Auth, callback: (user: User | null) => void): () => void;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    // Add minimal interface
  }
  export interface DocumentData {
    [key: string]: any;
  }
  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T;
  }
  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
  }
  export function getFirestore(app?: any): Firestore;
  export function doc(db: Firestore, ...pathSegments: string[]): any;
  export function setDoc(docRef: any, data: any): Promise<void>;
  export function getDoc(docRef: any): Promise<any>;
  export function updateDoc(docRef: any, data: any): Promise<void>;
  export function collection(db: Firestore, ...pathSegments: string[]): any;
  export function getDocs(query: any): Promise<QuerySnapshot>;
}