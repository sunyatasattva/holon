import { vi } from 'vitest';

// Global test setup

// Mock window and document globals for jsdom environment
global.window = global.window || {};
global.document = global.document || {};

// Mock requestAnimationFrame for any canvas animations
global.requestAnimationFrame = global.requestAnimationFrame || vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = global.cancelAnimationFrame || vi.fn(id => clearTimeout(id));

// Suppress console output during tests unless explicitly needed
const originalConsole = { ...console };

export const suppressConsole = () => {
  console.log = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
  console.time = vi.fn();
  console.timeEnd = vi.fn();
};

export const restoreConsole = () => {
  Object.assign(console, originalConsole);
};

// Automatically suppress console for cleaner test output
suppressConsole();