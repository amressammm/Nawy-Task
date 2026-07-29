import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Covers the pure logic in `lib/` — URL building, parameter clamping,
 * formatting — and nothing that renders. Components here are server
 * components that fetch during render, so testing them meaningfully would
 * mean standing up the API, which is what the runtime smoke pass is for.
 *
 * `node` rather than a DOM environment for the same reason: none of this
 * touches the document.
 */
export default defineConfig({
  test: {
    // No globals: the specs import `describe`/`it`/`expect` explicitly, so
    // `next build` typechecks them without needing extra ambient types.
    environment: 'node',
    include: ['lib/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
