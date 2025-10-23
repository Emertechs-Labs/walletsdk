```markdown
# Privy Sign-in & Embedded Wallets

This document summarizes how to use Privy to provide passwordless, social, passkey, and embedded wallet experiences in your app. Privy offers client SDKs (React, React Native) and server SDKs (Node.js) to manage user authentication and wallets.

## Summary
- Privy provides an embeddable wallet and authentication platform that can create wallets automatically on first login (email/social/passkey) and expose APIs for signing and sending transactions.
- Use the client SDK for UI-driven login flows and the server SDK (PrivyClient) for privileged operations (never embed secrets in client code).
- Privy is useful for onboarding mainstream users with minimal crypto knowledge by combining familiar auth (email/social) with automatic wallet creation.

## Important links
- Privy docs: https://docs.privy.io/
- React quickstart: https://docs.privy.io/basics/react/quickstart
- NodeJS server SDK: https://docs.privy.io/basics/nodeJS/setup
- Whitelabel recipes: https://docs.privy.io/recipes/react/whitelabel

## Open Source Tools and Dependencies

Privy integrates with several open source libraries and maintains some of their own open source tools.

### Key Open Source Dependencies
- **viem**: Ethereum library for TypeScript (used for account abstraction and wallet interactions).
- **wagmi**: React hooks for Ethereum (recommended for building on Privy's wallet APIs).
- **ethers**: Ethereum library for JavaScript/TypeScript.
- **@solana/web3.js**: Solana JavaScript SDK (for Solana wallet support).
- **@solana/kit** and **@solana/spl-token**: Additional Solana utilities.

### Privy's Open Source Contributions
- **shamir-secret-sharing**: Library for Shamir's Secret Sharing (used in key management).
- **slate**: Benchmarking tool for wallet latency and performance.

### SDKs Provided
Privy offers open-source SDKs for various platforms:
- @privy-io/react-auth (React)
- @privy-io/wagmi (wagmi connector)
- @privy-io/node (Node.js server SDK)
- And SDKs for React Native, iOS, Android, Unity, Flutter, Python, Java, and REST API.

### Relevant Links
- Privy GitHub: https://github.com/privy-io
- Shamir Secret Sharing: https://github.com/privy-io/shamir-secret-sharing
- Slate benchmarking tool: https://github.com/privy-io/slate
- Wagmi demo: https://github.com/privy-io/wagmi-demo
- Create Next.js app template: https://github.com/privy-io/create-next-app

### Notes
Privy's core platform is proprietary, but they heavily rely on and contribute to open source. For Ethereum integrations, they recommend viem and wagmi. Their open source repos focus on specific utilities like secret sharing and benchmarking.

Client (React) — passwordless email login:

```jsx
import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const { sendCode, loginWithCode } = useLoginWithEmail();

  return (
    <div>
      <input onChange={(e) => setEmail(e.target.value)} value={email} />
      <button onClick={() => sendCode({ email })}>Send Code</button>
      <input onChange={(e) => setCode(e.target.value)} value={code} />
      <button onClick={() => loginWithCode({ code })}>Login</button>
    </div>
  );
}
```

Client (React) — send transaction using embedded wallet:

```javascript
import { useSendTransaction } from '@privy-io/react-auth';

export default function SendTx() {
  const { sendTransaction } = useSendTransaction();
  return (
    <button onClick={() => sendTransaction({ to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C', value: 100000 })}>
      Send Transaction
    </button>
  );
}
```

Server (Node.js) — PrivyClient instantiation:

```javascript
import { PrivyClient } from '@privy-io/node';

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET,
});

// Use the privy client to verify tokens, create or manage wallets, and perform server-side txs
```

## Notes / Caveats
- Security: keep appSecret on server only. Use server SDK for operations requiring secrets.
- Embedded wallets are custodial-ish (Privy manages keys with TEE/sharding). Review your security and compliance needs before using.
- If you need raw on‑chain signature verification (for SIWE or custom flows) Privy server SDKs include helpers to verify and link wallets.

```
