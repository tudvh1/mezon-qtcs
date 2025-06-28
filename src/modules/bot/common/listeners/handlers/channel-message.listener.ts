import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ChannelMessage, Events } from 'mezon-sdk'

import { CommandDispatcher } from '@/modules/bot/interactions/command/command.dispatcher'

@Injectable()
export class ChannelMessageListener {
  private readonly logger = new Logger(ChannelMessageListener.name)

  constructor(private commandDispatcher: CommandDispatcher) {}

  @OnEvent(Events.ChannelMessage)
  public async handleCommand(eventMessage: ChannelMessage) {
    if (eventMessage.code) return // Skip edited messages

    const content = eventMessage.content?.t?.trim()
    if (!content) return

    if (typeof content == 'string' && content) {
      const firstChar = content.charAt(0)
      switch (firstChar) {
        case '*':
          await this.commandDispatcher.execute(content, eventMessage)
          break
        default:
          return
      }
    }
  }
}
