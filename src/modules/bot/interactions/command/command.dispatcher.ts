import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ChannelMessage } from 'mezon-sdk'

import { CommandStorage } from '../../common/storages'
import { extractMessageContent } from '../../common/utils'
import { BaseCommand } from './command.base'

@Injectable()
export class CommandDispatcher {
  private readonly logger = new Logger(CommandDispatcher.name)

  constructor(private readonly moduleRef: ModuleRef) {}

  public async execute(messageContent: string, eventMessage: ChannelMessage): Promise<void> {
    const [commandName, args] = extractMessageContent(messageContent)

    if (commandName === false) {
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
      await command.execute(args, eventMessage)
    } catch (error) {
      this.logger.error(`Error execute command ${commandName}: ${error.message}`, error)
    }
  }
}
