```markdown
# Sign in with Farcaster (SIWF / AuthKit)

This note explains how to integrate Farcaster's Sign-In With Farcaster (SIWF, FIP-11) flow using AuthKit. SIWF is a Farcaster-native authentication flow where users approve an assertion via Warpcast and your app verifies it server-side.

## Summary
- Farcaster provides AuthKit (React) to implement SIWF in apps. The flow uses Warpcast approvals and returns an assertion the server verifies.
- SIWF (FIP-11) differs from SIWE (EIP-4361) — use AuthKit for canonical integration.
- AuthKit supports React and provides examples (client + server) for verification.

## Important links
- Farcaster docs: https://docs.farcaster.xyz/
- SIWF overview: https://docs.farcaster.xyz/developers/siwf/
- AuthKit docs & examples: https://docs.farcaster.xyz/auth-kit/
- Farcaster protocol discussions (FIP-11): https://github.com/farcasterxyz/protocol/discussions/110

## Quickstart (React, high level)

1. Install AuthKit per docs.
2. Wrap your app with AuthKit provider and configure domain, RPC and callback endpoints.
3. Use the provided SignIn/SignOut components or the programmatic API to start the flow.

Client snippet (AuthKit / React):

```tsx
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider, SignInButton } from '@farcaster/auth-kit';

const config = {
  rpcUrl: 'https://mainnet.base.org/', // point to Base if you want chain-specific behavior
  domain: 'example.com',
  callbackUrl: 'https://example.com/api/farcaster/callback',
};

function App() {
  return (
    <AuthKitProvider config={config}>
      <SignInButton />
    </AuthKitProvider>
  );
}
```

Server-side (verify assertion):
- AuthKit provides example server routes (Next.js) which receive the assertion payload and verify the signature/assertion per the docs. Follow the examples in the AuthKit docs for exact server code.

## Notes / Caveats
- SIWF uses Warpcast approval flows and UX differs from SIWE (may show approval modals in Warpcast mobile apps).
- If you need both Ethereum wallet signature verification (SIWE) and Farcaster identity linking, implement both flows and link accounts server-side.

```
