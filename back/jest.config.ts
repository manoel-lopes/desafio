import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '\\.e2e-spec\\.ts$'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/*.e2e-spec.ts',
    '!**/prisma/**',
    '!test/**',
    '!src/lib/**',
    '!src/util/**',
    '!src/external/**',
    '!src/infra/adapters/http/http-server/fasitfy/**',
    '!src/infra/persistence/repositories/cache/**',
    '!src/infra/providers/cache/redis/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.e2e-spec\\.ts$',
  ],
}

export default config
