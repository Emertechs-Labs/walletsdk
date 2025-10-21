# Setup Guide

## Installation

```bash
npm install @polymathuniversata/echain-wallet
```

## Optional Dependencies

For authentication features, install Firebase:

```bash
npm install firebase
```

## Configuration

### Basic Configuration

```typescript
import { config } from '@polymathuniversata/echain-wallet';
import { WagmiProvider } from 'wagmi';

function App() {
  return (
    <WagmiProvider config={config}>
      {/* Your app */}
    </WagmiProvider>
  );
}
```

### Firebase Setup (Optional)

```typescript
import { initializeFirebase } from '@polymathuniversata/echain-wallet';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  // ... other config
};

initializeFirebase(firebaseConfig);
```

## Environment Variables

Create a `.env` file:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

## Building

```bash
npm run build
```

## Testing

```bash
npm test
npm run test:coverage
```