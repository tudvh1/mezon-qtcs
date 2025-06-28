import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Events, MezonClient } from 'mezon-sdk'

import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name)
  private mezonClient: MezonClient

  constructor(
    private readonly mezonClientService: MezonClientService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.mezonClient = this.mezonClientService.getMezonClient()
    void this.initEvent()
  }

  private async initEvent() {
    try {
      await Promise.all([
        this.mezonClient.onChannelMessage(message => {
          void this.eventEmitter.emit(Events.ChannelMessage, message)
        }),
        this.mezonClient.onMessageButtonClicked(data => {
          void this.eventEmitter.emit(Events.MessageButtonClicked, data)
        }),
      ])
    } catch (error) {
      this.logger.error(`Error initializing bot gateway: ${error.message}`, error)
    }
  }
}
