import esbuild from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';

const isWatch = process.argv.includes('--watch');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build JavaScript bundles
const buildOptions = {
  entryPoints: {
    'index': 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'hooks/index': 'src/hooks/index.ts',
  },
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/react-query',
    '@hashgraph/sdk',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    '@metamask/sdk'
  ],
  minify: false,
  splitting: false,
  write: true,
  define: {
    'import.meta.glob': '{}',
    'global': 'globalThis'
  },
};

async function build() {
  try {
    console.log('Building ESM bundles...');
    await esbuild.build({
      ...buildOptions,
      format: 'esm',
      outExtension: { '.js': '.js' },
    });

    console.log('Generating TypeScript declarations...');
    execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (isWatch) {
  console.log('Starting watch mode...');
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  build();
}