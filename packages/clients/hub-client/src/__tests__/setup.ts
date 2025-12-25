/**
 * Vitest setup file for hub-client tests
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend Vitest's expect with DOM matchers
// Note: If you use @testing-library/jest-dom, you can extend expect here
