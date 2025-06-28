import { Logger } from '@nestjs/common'
import {
  ApiMessageMention,
  ChannelMessageContent,
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
} from 'mezon-sdk'
import { Clan } from 'mezon-sdk/dist/cjs/mezon-client/structures/Clan'
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message'
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel'
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime'

import { Menu, OrderItem } from '@/database/entities'
import { EMenuActionButton, EMenuCloseConfirmAction, EMenuFormName } from '@/modules/menu/menu.enum'
import { MenuService } from '@/modules/menu/menu.service'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { OrderService } from '@/modules/order/order.service'
import { EntityManager } from 'typeorm'
import { ButtonClick } from '../../../common/decorators'
import { BaseButtonClick } from '../button-click.base'

@ButtonClick('menu')
export class MenuButtonClick extends BaseButtonClick {
  private readonly logger = new Logger(MenuButtonClick.name)

  constructor(
    mezonClientService: MezonClientService,
    private readonly menuService: MenuService,
    orderService: OrderService,
  ) {
    super(mezonClientService, orderService)
  }

  // ============================================================================
  // MAIN EXECUTION LOGIC
  // ============================================================================

  public async execute(args: string[], eventButtonClick: MessageButtonClicked): Promise<void> {
    this.logger.log('Execute menu button click')

    const [menuId, action] = args

    if (!menuId || !action) {
      this.logger.error(`Invalid menu button click arguments: ${JSON.stringify(args)}`)
      return
    }

    const extraData = this.parseExtraData(eventButtonClick.extra_data)

    const menu = await this.menuService.getMenu(menuId)
    if (!menu) {
      this.logger.error(`Menu not found: ${menuId}`)
      return
    }

    const {
      clan,
      channel,
      message: menuMessage,
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

    switch (action as EMenuActionButton) {
      case EMenuActionButton.CloseConfirm:
        await this.handleCloseConfirmAction(
          menu,
          menuOwner.id,
          menuOwnerName,
          buttonClicker.id,
          buttonClickerName,
          menuMessage,
        )
        break
      case EMenuActionButton.Order:
        await this.handleOrderAction(
          menu,
          extraData,
          menuOwner.id,
          menuOwnerName,
          buttonClicker.id,
          buttonClickerName,
          clan,
          channel,
          menuMessage,
        )
        break
      default:
        this.logger.error(`Invalid action: ${action}`)
    }
  }

  private parseExtraData(data?: string): Record<string, any> {
    try {
      return JSON.parse(data || '{}') as Record<string, any>
    } catch (error) {
      this.logger.error(`Failed to parse extra data: ${data}`, error)
      return {}
    }
  }

  // ============================================================================
  // CLOSE CONFIRM ACTION HANDLERS
  // ============================================================================

  private async handleCloseConfirmAction(
    menu: Menu,
    menuOwnerId: string,
    menuOwnerName: string,
    buttonClickerId: string,
    buttonClickerName: string,
    menuMessage: Message,
  ): Promise<void> {
    if (buttonClickerId !== menuOwnerId) {
      this.logger.error(
        `User ${buttonClickerName} (${buttonClickerId}) attempted to close menu owned by ${menuOwnerName} (${menuOwnerId})`,
      )
      return
    }
    if (menu.closeConfirmMessageId) {
      this.logger.error(`Menu already has a close confirm message`)
      return
    }
    if (menu.isClosed) {
      this.logger.error(`Menu is already closed`)
      return
    }

    await this.menuService.createDatabaseTransaction(async transactionManager => {
      const confirmContent: ChannelMessageContent = {
        t: `@${menuOwnerName} Bạn có chắc chắn muốn đóng menu này không?`,
        components: [
          {
            components: [
              {
                id: `menu-close-confirm_${menu.id}_${EMenuCloseConfirmAction.No}`,
                type: EMessageComponentType.BUTTON,
                component: {
                  label: 'Không',
                  style: EButtonMessageStyle.SECONDARY,
                },
              },
              {
                id: `menu-close-confirm_${menu.id}_${EMenuCloseConfirmAction.Yes}`,
                type: EMessageComponentType.BUTTON,
                component: {
                  label: 'Có',
                  style: EButtonMessageStyle.SUCCESS,
                },
              },
            ],
          },
        ],
      }

      const mentionData: ApiMessageMention = {
        user_id: menuOwnerId,
        s: 0,
        e: menuOwnerName.length + 1,
      }

      const closeConfirmMessage = await menuMessage.reply(confirmContent, [mentionData])
      const closeConfirmMessageId = closeConfirmMessage?.message_id

      await this.menuService.updateMenuCloseConfirmMessageId(
        transactionManager,
        menu.id,
        closeConfirmMessageId,
      )
    })
  }

  // ============================================================================
  // ORDER ACTION HANDLERS
  // ============================================================================
  private async handleOrderAction(
    menu: Menu,
    extraData: Record<string, any>,
    menuOwnerId: string,
    menuOwnerName: string,
    buttonClickerId: string,
    buttonClickerName: string,
    clan: Clan,
    channel: TextChannel,
    menuMessage: Message,
  ): Promise<void> {
    const dishIds = extraData[EMenuFormName.DishIds] as string[] | undefined
    const note = extraData[EMenuFormName.Note] as string | undefined
    const selectedMenuDishId = dishIds?.[0]

    if (!selectedMenuDishId) {
      this.logger.error('No dish ID provided')
      return
    }

    const selectedMenuDish = await this.menuService.getMenuDish(menu.id, selectedMenuDishId)
    if (!selectedMenuDish) {
      this.logger.error(`Menu dish not found: menuId=${menu.id}, dishId=${selectedMenuDishId}`)
      return
    }

    await this.orderService.createDatabaseTransaction(async transactionManager => {
      const createdOrder = await this.orderService.createOrder(transactionManager, {
        menuId: menu.id,
        userId: buttonClickerId,
      })

      const createdOrderItem = await this.orderService.createOrderItem(
        transactionManager,
        createdOrder.id,
        {
          menuDishId: selectedMenuDishId,
          note,
        },
      )

      const allOrderItems = await this.orderService.getOrderItemsByMenuId(
        transactionManager,
        menu.id,
      )

      const orderReportMessage = await this.handleOrderReportMessage(
        menu,
        allOrderItems,
        createdOrder.id,
        menuOwnerId,
        menuOwnerName,
        clan,
        channel,
        menuMessage,
        transactionManager,
      )

      await this.sendOrderNotification(
        orderReportMessage,
        createdOrderItem,
        buttonClickerId,
        buttonClickerName,
      )
    })
  }

  private async handleOrderReportMessage(
    menu: Menu,
    orderItems: OrderItem[],
    orderId: string,
    menuOwnerId: string,
    menuOwnerName: string,
    clan: Clan,
    channel: TextChannel,
    menuMessage: Message,
    transactionManager: EntityManager,
  ): Promise<Message> {
    const reportContent = await this.generateOrderReportContent(
      orderItems,
      orderId,
      menuOwnerName,
      clan,
    )

    if (menu.reportMessageId) {
      const existingReportMessage = await this.mezonClientService.fetchMessage(
        channel,
        menu.reportMessageId,
      )
      await existingReportMessage.update(reportContent)
      return existingReportMessage
    } else {
      const mentionData: ApiMessageMention = {
        user_id: menuOwnerId,
        s: 0,
        e: menuOwnerName.length + 1,
      }

      const replyMessage = await menuMessage.reply(reportContent, [mentionData])
      const newReportMessageId = replyMessage.message_id

      await this.menuService.updateMenuReportMessageId(
        transactionManager,
        menu.id,
        newReportMessageId,
      )

      return await this.mezonClientService.fetchMessage(channel, newReportMessageId)
    }
  }

  private async sendOrderNotification(
    reportMessage: Message,
    orderItem: OrderItem,
    userId: string,
    userName: string,
  ): Promise<void> {
    const orderSummary = await this.orderService.getSingleOrderItemSummary(orderItem)

    const mentionText = `@${userName}`
    const actionText = ` đã đặt `
    const fullNotificationText = `${mentionText}${actionText}${orderSummary}`

    const notificationContent: ChannelMessageContent = {
      t: fullNotificationText,
      mk: [
        {
          type: EMarkdownType.CODE,
          s: mentionText.length + actionText.length,
          e: fullNotificationText.length,
        },
      ],
    }

    const mentionData: ApiMessageMention = {
      user_id: userId,
      s: 0,
      e: mentionText.length,
    }

    await reportMessage.reply(notificationContent, [mentionData])
  }
}
