import { getFirestoreDb } from '../lib/firebase';

export interface WalletBinding {
  id: string;
  walletAddress: string;
  network: 'ethereum' | 'hedera';
  boundAt: Date;
  isActive: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  createdAt: Date;
  universalWallet: string;
  walletBindings: WalletBinding[];
}

export class UserService {
  private get db() {
    return getFirestoreDb();
  }

  async createUserProfile(uid: string, email: string): Promise<void> {
    const { doc, setDoc } = await import('firebase/firestore') as typeof import('firebase/firestore');
    const userRef = doc(this.db, 'users', uid);
    const universalWallet = await this.generateUniversalWallet();
    await setDoc(userRef, {
      uid,
      email,
      createdAt: new Date(),
      universalWallet
    });
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const { doc, getDoc } = await import('firebase/firestore') as typeof import('firebase/firestore');
    const userRef = doc(this.db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();
    const walletBindings = await this.getWalletBindings(uid);

    return {
      uid: userData.uid,
      email: userData.email,
      createdAt: userData.createdAt.toDate(),
      universalWallet: userData.universalWallet,
      walletBindings
    };
  }

  async bindWallet(uid: string, walletAddress: string, network: 'ethereum' | 'hedera'): Promise<void> {
    const { doc, setDoc } = await import('firebase/firestore') as typeof import('firebase/firestore');
    const bindingId = `${network}_${walletAddress}`;
    const bindingRef = doc(this.db, 'users', uid, 'walletBindings', bindingId);

    await setDoc(bindingRef, {
      walletAddress,
      network,
      boundAt: new Date(),
      isActive: true
    });
  }

  async unbindWallet(uid: string, walletAddress: string, network: 'ethereum' | 'hedera'): Promise<void> {
    const { doc, updateDoc } = await import('firebase/firestore') as any;
    const bindingId = `${network}_${walletAddress}`;
    const bindingRef = doc(this.db, 'users', uid, 'walletBindings', bindingId);

    await updateDoc(bindingRef, {
      isActive: false
    });
  }

  async getWalletBindings(uid: string): Promise<WalletBinding[]> {
    const { collection, getDocs } = await import('firebase/firestore') as typeof import('firebase/firestore');
    const bindingsRef = collection(this.db, 'users', uid, 'walletBindings');
    const bindingsSnap = await getDocs(bindingsRef);

    return bindingsSnap.docs.map((doc: any) => ({
      id: doc.id,
      walletAddress: doc.data().walletAddress,
      network: doc.data().network,
      boundAt: doc.data().boundAt.toDate(),
      isActive: doc.data().isActive
    }));
  }

  async getActiveWalletBindings(uid: string): Promise<WalletBinding[]> {
    const bindings = await this.getWalletBindings(uid);
    return bindings.filter(binding => binding.isActive);
  }

  async isWalletBound(uid: string, walletAddress: string, network: 'ethereum' | 'hedera'): Promise<boolean> {
    const bindings = await this.getActiveWalletBindings(uid);
    return bindings.some(binding => binding.walletAddress === walletAddress && binding.network === network);
  }

  private async generateUniversalWallet(): Promise<string> {
    // Generate a random Ethereum address as the universal wallet
    const { Wallet } = await import('ethers');
    const wallet = Wallet.createRandom();
    return wallet.address;
  }
}

export const userService = new UserService();