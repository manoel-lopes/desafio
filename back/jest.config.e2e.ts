import type { Config } from 'jest'
import unitConfig from './jest.config'

const config: Config = {
  ...unitConfig,
  testMatch: ['**/*.e2e-spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-e2e.ts'],
  globalSetup: '<rootDir>/__tests__/global-setup-e2e.ts',
  globalTeardown: '<rootDir>/__tests__/global-teardown-e2e.ts',
  testTimeout: 300_000,
}

export default config
