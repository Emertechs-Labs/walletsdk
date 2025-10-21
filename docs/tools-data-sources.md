# Open-Source Tools & Data Sources

## Core Philosophy

The Echain Wallet SDK is built entirely with open-source tools and libraries to ensure transparency, security, and community trust. All data sources are publicly available and properly attributed to avoid any copyright infringement.

## Open-Source Libraries Used

### Blockchain Libraries

| Library | Version | License | Source | Purpose |
|---------|---------|---------|--------|---------|
| **ethers.js** | 6.15.0 | MIT | [GitHub](https://github.com/ethers-io/ethers.js) | Ethereum blockchain interaction |
| **viem** | 2.17.0 | MIT | [GitHub](https://github.com/wagmi-dev/viem) | TypeScript Ethereum library |
| **wagmi** | 2.12.0 | MIT | [GitHub](https://github.com/wagmi-dev/wagmi) | React Ethereum hooks |
| **@hashgraph/sdk** | 2.50.0 | Apache-2.0 | [GitHub](https://github.com/hashgraph/hedera-sdk-js) | Hedera Hashgraph SDK |

### UI & Design Libraries

| Library | Version | License | Source | Purpose |
|---------|---------|---------|--------|---------|
| **lucide-react** | 0.460.0 | ISC | [GitHub](https://github.com/lucide-icons/lucide) | Icon library |
| **react** | 18.3.1 | MIT | [GitHub](https://github.com/facebook/react) | UI framework |
| **react-dom** | 18.3.1 | MIT | [GitHub](https://github.com/facebook/react) | React DOM rendering |

### Development Tools

| Tool | Version | License | Source | Purpose |
|------|---------|---------|--------|---------|
| **TypeScript** | 5.2.0 | Apache-2.0 | [GitHub](https://github.com/microsoft/TypeScript) | Type safety |
| **ESLint** | 8.52.0 | MIT | [GitHub](https://github.com/eslint/eslint) | Code linting |
| **Jest** | 29.7.0 | MIT | [GitHub](https://github.com/jestjs/jest) | Testing framework |
| **tsup** | 8.0.0 | MIT | [GitHub](https://github.com/egoist/tsup) | Build tool |

### Optional Dependencies

| Library | Version | License | Source | Purpose |
|---------|---------|---------|--------|---------|
| **firebase** | 10.12.0 | Apache-2.0 | [GitHub](https://github.com/firebase/firebase-js-sdk) | Authentication & database |

## Data Sources & References

### Official Documentation

All implementation details are derived from official, publicly available documentation:

#### Ethereum Ecosystem
- **Ethereum Foundation**: [ethereum.org](https://ethereum.org/) - Core concepts and standards
- **EIP Repository**: [eips.ethereum.org](https://eips.ethereum.org/) - Ethereum Improvement Proposals
- **Base Network**: [docs.base.org](https://docs.base.org/) - Base network documentation
- **Infura**: [docs.infura.io](https://docs.infura.io/) - Ethereum node infrastructure
- **Alchemy**: [docs.alchemy.com](https://docs.alchemy.com/) - Web3 development platform

#### Hedera Hashgraph
- **Hedera Developer Docs**: [docs.hedera.com](https://docs.hedera.com/) - Official SDK documentation
- **Hedera Consensus Service**: [docs.hedera.com/guides/sdks/consensus-service](https://docs.hedera.com/guides/sdks/consensus-service) - Consensus mechanisms
- **Hedera Token Services**: [docs.hedera.com/guides/sdks/token-services](https://docs.hedera.com/guides/sdks/token-services) - Token operations

#### Wallet Standards
- **EIP-1193**: [eips.ethereum.org/EIPS/eip-1193](https://eips.ethereum.org/EIPS/eip-1193) - Ethereum Provider API
- **EIP-1474**: [eips.ethereum.org/EIPS/eip-1474](https://eips.ethereum.org/EIPS/eip-1474) - Remote procedure call specification
- **WalletConnect**: [docs.walletconnect.com](https://docs.walletconnect.com/) - Cross-platform wallet protocol

### Security Standards

#### Cryptographic Standards
- **NIST SP 800-57**: Key Management Guidelines
- **RFC 2898**: PKCS #5 Password-Based Cryptography
- **RFC 5869**: HMAC-based Extract-and-Expand Key Derivation Function (HKDF)

#### Web Security
- **OWASP Guidelines**: [owasp.org](https://owasp.org/) - Web application security
- **Content Security Policy**: [w3.org/TR/CSP/](https://w3.org/TR/CSP/) - W3C specification
- **Same-Origin Policy**: Browser security model

### Testing & Quality Assurance

#### Testing Frameworks
- **Jest**: [jestjs.io](https://jestjs.io/) - JavaScript testing framework
- **Testing Library**: [testing-library.com](https://testing-library.com/) - React testing utilities
- **jsdom**: [github.com/jsdom/jsdom](https://github.com/jsdom/jsdom) - DOM implementation

#### Code Quality
- **ESLint**: [eslint.org](https://eslint.org/) - JavaScript linting
- **Prettier**: [prettier.io](https://prettier.io/) - Code formatting
- **TypeScript ESLint**: [typescript-eslint.io](https://typescript-eslint.io/) - TypeScript linting

## Implementation References

### Wallet Connection Patterns
- **RainbowKit**: [rainbowkit.com](https://rainbowkit.com/) - Wallet connection UI patterns
- **Web3Modal**: [web3modal.com](https://web3modal.com/) - Multi-wallet connection library
- **ConnectKit**: [docs.family.co/connectkit](https://docs.family.co/connectkit) - Wallet connection components

### React Patterns
- **React Documentation**: [react.dev](https://react.dev/) - Official React docs
- **React Hooks**: [react.dev/reference/react](https://react.dev/reference/react) - Hook patterns
- **Custom Hooks**: Community patterns from [usehooks.com](https://usehooks.com/)

### State Management
- **Zustand**: [zustand-demo.pmnd.rs](https://zustand-demo.pmnd.rs/) - State management patterns
- **React Context**: [react.dev/reference/react/useContext](https://react.dev/reference/react/useContext) - Context API patterns

## License Compliance

### MIT License Libraries
All core dependencies use the MIT license, ensuring maximum compatibility and freedom for commercial use.

### Apache-2.0 License Libraries
Hedera SDK and Firebase use Apache-2.0, which is OSI-approved and compatible with MIT.

### ISC License Libraries
Lucide React uses ISC license, which is functionally equivalent to MIT.

## Avoiding Copyright Issues

### Original Content Only
- All code is original implementation
- No copy-paste from proprietary sources
- Proper attribution to all referenced materials

### Public Domain Resources
- Icons from Lucide (ISC licensed)
- Documentation templates from open-source projects
- Design patterns from established React/TypeScript communities

### Fair Use Compliance
- Limited use of documentation excerpts for educational purposes
- Proper citation of all external references
- No reproduction of copyrighted images or proprietary content

## Data Accuracy Verification

### Automated Testing
- Unit tests verify functionality against known good values
- Integration tests validate end-to-end workflows
- Type checking ensures API compatibility

### Manual Verification
- Cross-reference with multiple official sources
- Community review of implementation details
- Regular updates to stay current with standards

### Community Validation
- Open-source nature allows community scrutiny
- GitHub issues for bug reports and corrections
- Pull request reviews for quality assurance

## Future Tool Evaluation

When considering new tools or libraries:

1. **License Check**: Must be OSI-approved open-source license
2. **Maintenance**: Active development and community support
3. **Security**: Regular security audits and updates
4. **Compatibility**: Works with existing stack
5. **Bundle Size**: Minimal impact on application size
6. **Documentation**: Comprehensive and accurate docs

This ensures the SDK remains fully open-source, legally compliant, and technically sound.