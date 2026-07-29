/**
 * Unit tests only. Nothing here touches Postgres or MinIO, so `npm test` runs
 * on a cold checkout with no containers — which is the point: the parts worth
 * testing are the ones that decide something (what a query narrows to, whether
 * a file is really a JPEG, whether an id is in range), and none of them need
 * a database to answer.
 *
 * Tests live beside the code they cover rather than in a parallel tree, so a
 * file and its test move together.
 */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!main.ts', '!**/*.module.ts'],
  coverageDirectory: '../coverage',
};
