import '@testing-library/jest-dom/vitest';

// jsdom in Vitest doesn't always expose localStorage on globalThis — polyfill it.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(String(k)),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i) => [...store.keys()][i] ?? null,
  };
}

if (typeof globalThis.crypto === 'undefined') {
  // Minimal fallback for generateId in tests.
  globalThis.crypto = { randomUUID: () => `test-${Math.random().toString(36).slice(2)}` };
}
