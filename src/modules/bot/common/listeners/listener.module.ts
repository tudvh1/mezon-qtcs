import { Module } from '@nestjs/common'

import { ButtonClickModule } from '../../interactions/button-click/button-click.module'
import { CommandModule } from '../../interactions/command/command.module'
import { ChannelMessageListener, MessageButtonClickedListener } from './handlers'

@Module({
  imports: [CommandModule, ButtonClickModule],
  providers: [ChannelMessageListener, MessageButtonClickedListener],
  exports: [ChannelMessageListener, MessageButtonClickedListener],
})
export class ListenerModule {}
