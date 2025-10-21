import { getFirebaseAuth } from '../lib/firebase';
import { userService } from './userService';

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

export class AuthService {
  private get auth() {
    return getFirebaseAuth();
  }

  async signUp(email: string, password: string) {
    const { createUserWithEmailAndPassword } = await import('firebase/auth') as typeof import('firebase/auth');
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await userService.createUserProfile(result.user.uid, email);
    return result;
  }

  async signIn(email: string, password: string) {
    const { signInWithEmailAndPassword } = await import('firebase/auth') as typeof import('firebase/auth');
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signOut() {
    const { signOut } = await import('firebase/auth') as typeof import('firebase/auth');
    return signOut(this.auth);
  }

  async resetPassword(email: string) {
    const { sendPasswordResetEmail } = await import('firebase/auth') as typeof import('firebase/auth');
    return sendPasswordResetEmail(this.auth, email);
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { onAuthStateChanged } = require('firebase/auth') as typeof import('firebase/auth');
    return onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });
      } else {
        callback(null);
      }
    });
  }

  getCurrentUser(): AuthUser | null {
    const user = this.auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      };
    }
    return null;
  }
}

export const authService = new AuthService();