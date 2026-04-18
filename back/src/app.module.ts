import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UseCasesModule } from './domain/application/usecases/usecases.module'
import { envSchema } from './infra/env/env'
import { EnvModule } from './infra/env/env.module'
import { EventsModule } from './infra/events/events.module'
import { ControllersModule } from './infra/http/presentation/controllers/controllers.module'
import { RepositoriesModule } from './infra/persistence/repositories/repositories.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),
    EnvModule,
    RepositoriesModule,
    UseCasesModule,
    EventsModule,
    ControllersModule,
  ],
})
export class AppModule {}
