import { Logger } from '@nestjs/common'
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message'
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel'
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime'

import { Menu } from '@/database/entities'
import { EMenuCloseConfirmAction } from '@/modules/menu/menu.enum'
import { MenuService } from '@/modules/menu/menu.service'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { OrderService } from '@/modules/order/order.service'
import { EMarkdownType } from 'mezon-sdk/dist/cjs/interfaces/client'
import { ButtonClick } from '../../../common/decorators'
import { BaseButtonClick } from '../button-click.base'

@ButtonClick('menu-close-confirm')
export class MenuCloseConfirmButtonClick extends BaseButtonClick {
  private readonly logger = new Logger(MenuCloseConfirmButtonClick.name)

  constructor(
    mezonClientService: MezonClientService,
    orderService: OrderService,
    private readonly menuService: MenuService,
  ) {
    super(mezonClientService, orderService)
  }

  // ============================================================================
  // MAIN EXECUTION LOGIC
  // ============================================================================

  public async execute(args: string[], eventButtonClick: MessageButtonClicked): Promise<void> {
    this.logger.log('Execute menu-close-confirm button click')

    const [menuId, action] = args
    if (!menuId || !action) {
      this.logger.error(`Invalid menu button click arguments: ${JSON.stringify(args)}`)
      return
    }

    const menu = await this.menuService.getMenu(menuId)
    if (!menu || !menu.closeConfirmMessageId) {
      this.logger.error(`Menu not found or missing close confirm message: ${menuId}`)
      return
    }

    const {
      clan,
      channel,
      message: closeConfirmMessage,
    } = await this.mezonClientService.getMessageWithContext(
      menu.clanId,
      eventButtonClick.channel_id,
      eventButtonClick.message_id,
    )

    const [menuOwner, buttonClicker] = await Promise.all([
      this.mezonClientService.fetchUser(clan, menu.ownerId),
      this.mezonClientService.fetchUser(clan, eventButtonClick.user_id),
    ])
    const menuOwnerName = this.mezonClientService.getUserDisplayName(menuOwner)
    const buttonClickerName = this.mezonClientService.getUserDisplayName(buttonClicker)

    if (buttonClicker.id !== menuOwner.id) {
      this.logger.error(
        `User ${buttonClickerName} (${buttonClicker.id}) attempted to close menu owned by ${menuOwnerName} (${menuOwner.id})`,
      )
      return
    }

    switch (action as EMenuCloseConfirmAction) {
      case EMenuCloseConfirmAction.No:
        await this.handleNoAction(menuId, closeConfirmMessage)
        break
      case EMenuCloseConfirmAction.Yes:
        await this.handleYesAction(menu, channel, closeConfirmMessage, menuOwner.id, menuOwnerName)
        break
      default:
        this.logger.error(`Invalid action: ${action}`)
        break
    }
  }

  // ============================================================================
  // NO ACTION HANDLERS
  // ============================================================================

  private async handleNoAction(menuId: string, closeConfirmMessage: Message): Promise<void> {
    await this.menuService.createDatabaseTransaction(async transactionManager => {
      await Promise.all([
        closeConfirmMessage.delete(),
        this.menuService.updateMenuCloseConfirmMessageId(transactionManager, menuId, null),
      ])
    })
  }

  // ============================================================================
  // YES ACTION HANDLERS
  // ============================================================================

  private async handleYesAction(
    menu: Menu,
    channel: TextChannel,
    closeConfirmMessage: Message,
    menuOwnerId: string,
    menuOwnerName: string,
  ): Promise<void> {
    await this.menuService.createDatabaseTransaction(async transactionManager => {
      await this.menuService.closeMenu(transactionManager, menu.id)

      const menuMessage = await this.mezonClientService.fetchMessage(channel, menu.messageId)
      const messageContent = 'Menu này đã đã đóng'
      const menuUpdatePromise = menuMessage.update({
        t: messageContent,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: messageContent.length,
          },
        ],
      })

      const reportUpdatePromise = menu.reportMessageId
        ? this.mezonClientService
            .fetchMessage(channel, menu.reportMessageId)
            .then(async reportMessage => {
              if (reportMessage.content.components) {
                delete reportMessage.content.components
              }
              return reportMessage.update(reportMessage.content)
            })
        : Promise.resolve()

      const userMentionText = `@${menuOwnerName}`
      const replyMessageContent = `${userMentionText} đã đóng menu`
      const replyPromise = menuMessage.reply(
        {
          t: replyMessageContent,
        },
        [
          {
            user_id: menuOwnerId,
            s: 0,
            e: userMentionText.length,
          },
        ],
      )

      await Promise.all([
        menuUpdatePromise,
        reportUpdatePromise,
        replyPromise,
        closeConfirmMessage.delete(),
        this.menuService.updateMenuCloseConfirmMessageId(transactionManager, menu.id, null),
      ])
    })
  }
}
