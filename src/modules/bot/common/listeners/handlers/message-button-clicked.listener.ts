import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Events } from 'mezon-sdk'
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime'

import { ButtonClickDispatcher } from '@/modules/bot/interactions/button-click/button-click.dispatcher'

@Injectable()
export class MessageButtonClickedListener {
  private readonly logger = new Logger(MessageButtonClickedListener.name)

  constructor(private buttonClickDispatcher: ButtonClickDispatcher) {}

  @OnEvent(Events.MessageButtonClicked)
  public async handleCommand(eventButtonClick: MessageButtonClicked) {
    await this.buttonClickDispatcher.execute(eventButtonClick)
  }
}
