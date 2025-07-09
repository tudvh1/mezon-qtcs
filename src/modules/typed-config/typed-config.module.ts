import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { envConfig } from './typed-config.config'
import { TypedConfigService } from './typed-config.service'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
