import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ChannelMessage, EMarkdownType } from 'mezon-sdk'

import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { ANONYMOUS_USER_ID } from '../../common/constants'
import { CommandStorage } from '../../common/storages'
import { extractMessageContent } from '../../common/utils'
import { BaseCommand } from './command.base'

@Injectable()
export class CommandDispatcher {
  private readonly logger = new Logger(CommandDispatcher.name)

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly mezonClientService: MezonClientService,
  ) {}

  public async execute(messageContent: string, eventMessage: ChannelMessage): Promise<void> {
    const [commandName, args] = extractMessageContent(messageContent)

    if (commandName === false) {
      return
    }

    const messageContext = await this.mezonClientService.getMessageContext(
      eventMessage.clan_id,
      eventMessage.channel_id,
      eventMessage.id,
    )
    const { message } = messageContext

    if (eventMessage.sender_id === ANONYMOUS_USER_ID) {
      const messageContent = '😤 Anonymous đi chỗ khác'
      await message.reply({
        t: messageContent,
        mk: [{ type: EMarkdownType.PRE, e: messageContent.length }],
      })
      return
    }

    const targetClass = CommandStorage.getCommand(commandName)

    if (!targetClass) {
      return
    }

    const command = this.moduleRef.get<BaseCommand>(targetClass)

    if (!command) {
      this.logger.error(`Command instance not found: ${commandName}`)
      return
    }

    try {
      this.logger.log(`Execute command ${commandName}, info: ${JSON.stringify(eventMessage)}`)
      await command.execute(args, messageContext)
    } catch (error) {
      this.logger.error(`Error execute command ${commandName}: ${error.message}`, error)
    }
  }
}
