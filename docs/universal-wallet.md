# Universal Wallet Mode

## Overview

The Universal Wallet Mode automatically generates and manages wallets for users, eliminating the need for manual wallet connections. This is ideal for applications where users shouldn't worry about wallet management.

## How It Works

1. **Automatic Generation**: When a user signs up, a new wallet is automatically created
2. **Secure Storage**: Private keys are encrypted and stored securely
3. **Seamless Transactions**: Users can transact without manual wallet interactions
4. **Binding Management**: Users can unbind and bind new wallets as needed

## Implementation

```typescript
import { useUniversalWallet } from '@polymathuniversata/echain-wallet';

function App() {
  const { wallet, createWallet, bindWallet, unbindWallet } = useUniversalWallet();

  return (
    <div>
      {!wallet ? (
        <button onClick={createWallet}>Create Universal Wallet</button>
      ) : (
        <div>
          <p>Wallet: {wallet.address}</p>
          <button onClick={() => unbindWallet(wallet.address)}>Unbind</button>
        </div>
      )}
    </div>
  );
}
```

## Security Considerations

- Private keys are encrypted with user credentials
- No client-side key storage in plain text
- Optional hardware security integration
- Regular key rotation recommended