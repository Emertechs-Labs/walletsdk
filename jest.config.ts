import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^wagmi$': '<rootDir>/src/__mocks__/wagmi.ts',
    '^wagmi/(.*)$': '<rootDir>/src/__mocks__/wagmi.ts',
    '^@rainbow-me/rainbowkit$': '<rootDir>/src/__mocks__/rainbowkit.ts',
    '^@rainbow-me/rainbowkit/(.*)$': '<rootDir>/src/__mocks__/rainbowkit.ts',
    '^../lib/wagmi$': '<rootDir>/src/__mocks__/wagmi.ts',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
    '!src/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(wagmi|@wagmi|@rainbow-me|viem|@tanstack)/)',
  ],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};

export default config;