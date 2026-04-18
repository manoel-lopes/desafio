import type { INestApplication, Type } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { UseCase } from '@/core/domain/application/use-case'
import { FastifyAdapter } from '@/infra/adapters/http/fastify-adapter'
import { AppModule } from '@/app.module'
import { ThrowingUseCaseStub } from '@tests/helpers/domain/application/use-case.stub'
import { prepareE2eSchemaOnce } from '@tests/helpers/e2e/prepare-e2e-schema'

type MakeAppWithErrorStubOptions = {
  useCaseClass: Type<UseCase>
}

export async function makeAppWithErrorStub (
  options: MakeAppWithErrorStubOptions
): Promise<INestApplication> {
  await prepareE2eSchemaOnce()
  const { useCaseClass } = options
  const fastifyAdapter = new FastifyAdapter()
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(useCaseClass)
    .useClass(ThrowingUseCaseStub)
    .compile()
  const app = moduleRef.createNestApplication(fastifyAdapter, { logger: false })
  await fastifyAdapter.configure(app)
  await app.init()
  return app
}
