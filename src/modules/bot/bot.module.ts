import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { MezonClientModule } from '@/modules/mezon-client/mezon-client.module'
import { BotGateway } from './common/events'
import { ListenerModule } from './common/listeners/listener.module'
import { SendMessageScheduler } from './common/schedulers'
import { ButtonClickModule } from './interactions/button-click/button-click.module'
import { CommandModule } from './interactions/command/command.module'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MezonClientModule,
    ListenerModule,
    CommandModule,
    ButtonClickModule,
  ],
  providers: [BotGateway, SendMessageScheduler],
})
export class BotModule {}
