import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'], // Only include tests from src/
    exclude: [
      'node_modules/',
      'dist',
      'e2e/**',
      '**/*.spec.ts', // Exclude Playwright spec files
      'build',
      'coverage'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        100: true, // Enforce 100% coverage for lines, branches, functions, statements
        lines: 95, // Minimum 95% line coverage
        branches: 90, // Minimum 90% branch coverage
        functions: 95, // Minimum 95% function coverage
        statements: 95 // Minimum 95% statement coverage
      },
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        'build',
        'coverage'
      ]
    },
    // Fail if tests are skipped or only marked pending
    bail: 1,
    // Timeout for each test (5 seconds)
    testTimeout: 5000,
    // Use threading pool for parallel test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 2,
        maxThreads: 4
      }
    }
  }
});
