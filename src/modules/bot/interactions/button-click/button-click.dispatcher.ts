import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime'

import { ButtonClickStorage } from '../../common/storages'
import { extractButtonId } from '../../common/utils'
import { BaseButtonClick } from './button-click.base'
import { ANONYMOUS_USER_ID } from '../../common/constants'

@Injectable()
export class ButtonClickDispatcher {
  private readonly logger = new Logger(ButtonClickDispatcher.name)

  constructor(private readonly moduleRef: ModuleRef) {}

  public async execute(eventButtonClick: MessageButtonClicked): Promise<void> {
    const [buttonName, args] = extractButtonId(eventButtonClick.button_id)

    if (buttonName === false || eventButtonClick.sender_id === ANONYMOUS_USER_ID) {
      return
    }

    const targetClass = ButtonClickStorage.getButtonClick(buttonName)

    if (!targetClass) {
      return
    }

    const buttonClick = this.moduleRef.get<BaseButtonClick>(targetClass)

    if (!buttonClick) {
      this.logger.error(`Button-click instance not found: ${buttonName}`)
      return
    }

    try {
      this.logger.log(
        `Execute button-click ${buttonName}, info: ${JSON.stringify(eventButtonClick)}`,
      )
      await buttonClick.execute(args, eventButtonClick)
    } catch (error) {
      this.logger.error(`Error execute button-click ${buttonName}: ${error.message}`, error)
    }
  }
}
