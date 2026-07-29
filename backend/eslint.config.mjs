import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/**
 * Type-aware linting, which is the point of running ESLint here at all.
 *
 * Without type information the useful rules are unavailable, and what remains
 * mostly duplicates what `tsc` already reports. `no-floating-promises` is the
 * one that earns its keep in a Nest codebase: an un-awaited promise in a
 * lifecycle hook fails silently, and nothing else catches it.
 *
 * Formatting rules are deliberately absent — Prettier owns that, and
 * `eslint-config-prettier` comes last to switch off anything that overlaps.
 */
export default tseslint.config(
  // Config files sit outside tsconfig's `include`, so the type-aware rules
  // have no program to check them against.
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'eslint.config.mjs', 'jest.config.js'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Nest resolves providers from constructor parameter types, so an
      // unused-looking `private readonly prisma` is load-bearing.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  prettier,
);
