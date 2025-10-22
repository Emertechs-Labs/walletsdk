# Echain Wallet SDK Documentation

## Overview

The Echain Wallet SDK provides comprehensive wallet management for Ethereum, Base, and Hedera networks with optional email authentication and automatic wallet binding.

## Documentation Index

### 📋 Project Documentation
- **[Project Overview](project-overview.md)** - Complete project vision, features, and status
- **[Roadmap](roadmap.md)** - Detailed development roadmap and future plans
- **[Architecture](architecture.md)** - Technical architecture and design decisions
- **[Audit Implementation Plan](audit-implementation-plan.md)** - Code quality and security improvement roadmap

### 🛠️ Developer Guides
- **[Setup Guide](setup.md)** - Installation and configuration instructions
- **[Universal Wallet](universal-wallet.md)** - Automatic wallet generation and management
- **[Tools & Data Sources](tools-data-sources.md)** - Open-source tools and data references

### 📚 API Reference
- **[Main README](../README.md)** - Complete API documentation and usage examples

## Key Features

- **🔐 Real Wallet Integration**: Production-ready connections to MetaMask, WalletConnect, HashPack
- **🌐 Multi-Network Support**: Ethereum, Base, and Hedera Hashgraph
- **⚛️ React Components**: Pre-built UI components with TypeScript
- **🔒 Optional Authentication**: Firebase-based email auth (no forced dependencies)
- **🎭 Universal Wallet**: Automatic wallet generation for seamless UX
- **🔗 Wallet Binding**: Link multiple wallets to user accounts
- **🧪 Well Tested**: 95%+ test coverage with comprehensive validation
- **📚 Fully Documented**: Complete guides and API references

## Architecture Highlights

- **Modular Design**: Clean separation of concerns with layered architecture
- **Open-Source Stack**: Built with MIT/Apache licensed tools only
- **Security First**: No private key storage, encrypted client-side operations
- **Performance Optimized**: Tree-shaking, lazy loading, and efficient state management
- **Developer Friendly**: Optional features, clear APIs, and comprehensive TypeScript support

## Support & Community

- **📖 Documentation**: Comprehensive guides in this directory
- **🐛 Issues**: [GitHub Issues](https://github.com/Emertechs-Labs/Echain/issues) for bug reports
- **💬 Discussions**: [GitHub Discussions](https://github.com/Emertechs-Labs/Echain/discussions) for Q&A
- **📧 Email**: support@echain.events for enterprise support

## License & Legal

This project is licensed under the MIT License. All tools and data sources are open-source and properly attributed to avoid copyright issues. See [Tools & Data Sources](tools-data-sources.md) for detailed licensing information.

---

*Built with ❤️ for the Web3 community using open-source technologies*

## Quick Start

### Basic Setup (No Auth)

```typescript
import { UnifiedConnectModal } from '@polymathuniversata/echain-wallet';

function App() {
  return <UnifiedConnectModal />;
}
```

### With Authentication

```typescript
import {
  initializeFirebase,
  UnifiedConnectModal,
  useAuth
} from '@polymathuniversata/echain-wallet';

// Initialize Firebase
initializeFirebase({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
});

function App() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <UnifiedConnectModal />
      )}
    </div>
  );
}
```

## User Flow

1. **Sign Up**: User creates account with email/password
2. **Universal Wallet**: SDK automatically generates a default Ethereum wallet
3. **Wallet Binding**: User can connect additional wallets (MetaMask, etc.)
4. **Management**: User can unbind compromised wallets and bind new ones
5. **Persistence**: Account and bindings persist across sessions

## API Reference

### Authentication

#### useAuth Hook

```typescript
const {
  user,        // Current user object
  loading,     // Loading state
  signUp,      // (email, password) => Promise
  signIn,      // (email, password) => Promise
  signOut,     // () => Promise
  resetPassword // (email) => Promise
} = useAuth();
```

#### useUserWallets Hook

```typescript
const {
  walletBindings,    // Array of bound wallets
  loading,          // Loading state
  bindWallet,       // (address, network) => Promise
  unbindWallet,     // (address, network) => Promise
  isWalletBound,    // (address, network) => boolean
  refreshBindings   // () => Promise
} = useUserWallets();
```

### Firebase Configuration

```typescript
import { initializeFirebase } from '@polymathuniversata/echain-wallet';

const config = {
  apiKey: string,
  authDomain: string,
  projectId: string,
  storageBucket: string,
  messagingSenderId: string,
  appId: string
};

initializeFirebase(config);
```

## Security Considerations

- Firebase dependencies are optional - install only if using auth features
- Private keys are never stored - only public addresses
- User data is encrypted in transit and at rest
- Wallet bindings can be managed independently of accounts

## Troubleshooting

### Firebase Not Available
If you see "Firebase is not installed" errors:
```bash
npm install firebase
```

### Auth Errors
- Ensure Firebase project is configured correctly
- Check that Authentication is enabled in Firebase Console
- Verify Firestore rules allow user document access

### Wallet Connection Issues
- Ensure wallet extensions are installed
- Check network compatibility
- Verify wallet permissions