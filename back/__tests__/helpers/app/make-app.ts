import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { FastifyAdapter } from '@/infra/adapters/http/fastify-adapter'
import { AppModule } from '@/app.module'
import { prepareE2eSchemaOnce } from '@tests/helpers/e2e/prepare-e2e-schema'

export async function makeApp (): Promise<INestApplication> {
  await prepareE2eSchemaOnce()
  const fastifyAdapter = new FastifyAdapter()
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  const app = moduleRef.createNestApplication(fastifyAdapter, { logger: false })
  await fastifyAdapter.configure(app)
  await app.init()
  return app
}
