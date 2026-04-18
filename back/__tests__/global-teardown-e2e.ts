import { teardownAllE2eSchemaStateFiles } from './helpers/e2e/prepare-e2e-schema'

export default async function globalTeardown (): Promise<void> {
  await teardownAllE2eSchemaStateFiles()
}
