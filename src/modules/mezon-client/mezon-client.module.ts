import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { MezonClientService } from './mezon-client.service'

@Module({
  imports: [ConfigModule],
  providers: [MezonClientService],
  exports: [MezonClientService],
})
export class MezonClientModule {}
