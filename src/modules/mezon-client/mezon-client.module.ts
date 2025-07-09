import { Module } from '@nestjs/common'

import { MezonClientService } from './mezon-client.service'

@Module({
  imports: [],
  providers: [MezonClientService],
  exports: [MezonClientService],
})
export class MezonClientModule {}
