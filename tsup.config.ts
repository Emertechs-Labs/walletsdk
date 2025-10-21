import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'hooks/index': 'src/hooks/index.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // build for browser to avoid emitting node-style dynamic require shims
  platform: 'browser',
  // target modern browsers; adjust if you need wider support
  target: 'es2020',
  // Bundle everything to avoid relative path issues, but use ESM format to avoid dynamic require
  bundle: true,
  external: ['react', 'react-dom', '@tanstack/react-query', 'wagmi', 'viem', '@hashgraph/sdk', 'ua-parser-js'],
  // Force treeshaking to remove unused code
  treeshake: true,
  // Use esbuild's ESM output
  esbuildOptions(options) {
    options.format = 'esm';
    options.target = 'es2020';
    options.platform = 'browser';
  },
});