import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const migrateDeployLockPath = path.join(os.tmpdir(), 'prisma-e2e-migrate-deploy.lock')

export default async function globalSetup (): Promise<void> {
  fs.rmSync(migrateDeployLockPath, { recursive: true, force: true })
}
