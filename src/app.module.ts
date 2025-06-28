import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'

import { DatabaseModule } from './database/database.module'
import { BotModule } from './modules'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
