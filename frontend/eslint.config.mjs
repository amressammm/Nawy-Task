import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/**
 * Next's own rules, which cover the mistakes specific to the App Router:
 * client hooks in a server component, `<img>` where `next/image` belongs,
 * imports that would drag server-only code into the browser bundle.
 *
 * `eslint-config-next` is still an eslintrc-style shareable config, so it is
 * pulled in through FlatCompat. Prettier comes last, as on the backend.
 */
export default [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'eslint.config.mjs'] },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  prettier,
];
