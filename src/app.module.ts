import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { DatabaseModule } from './database/database.module'
import { BotModule } from './modules'
import { TypedConfigModule } from './modules/typed-config/typed-config.module'

@Module({
  imports: [TypedConfigModule, DatabaseModule, ScheduleModule.forRoot(), BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
