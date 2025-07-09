import { Logger } from '@nestjs/common'
import { ChannelMessageContent } from 'mezon-sdk'
import { Clan } from 'mezon-sdk/dist/cjs/mezon-client/structures/Clan'
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message'
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime'

import { Menu, OrderItem } from '@/database/entities'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { EOrderActionButton } from '@/modules/order/order.enum'
import { OrderService } from '@/modules/order/order.service'
import { ButtonClick } from '../../../common/decorators'
import { BaseButtonClick } from '../button-click.base'

@ButtonClick('order')
export class OrderButtonClick extends BaseButtonClick {
  private readonly logger = new Logger(OrderButtonClick.name)

  constructor(mezonClientService: MezonClientService, orderService: OrderService) {
    super(mezonClientService, orderService)
  }

  // ============================================================================
  // MAIN EXECUTION LOGIC
  // ============================================================================

  public async execute(args: string[], eventButtonClick: MessageButtonClicked): Promise<void> {
    const [orderId, type] = args

    if (!orderId || !type) {
      this.logger.error(`Invalid order button click arguments: ${JSON.stringify(args)}`)
      return
    }

    const order = await this.orderService.getOrderWithMenu(orderId)
    if (!order?.menu) {
      this.logger.error('Order or menu not found')
      return
    }

    const { clan, message: reportMessage } = await this.mezonClientService.getMessageContext(
      order.menu.clanId,
      eventButtonClick.channel_id,
      eventButtonClick.message_id,
    )

    const [menuOwner, buttonClicker] = await Promise.all([
      this.mezonClientService.fetchUser(clan, order.menu.ownerId),
      this.mezonClientService.fetchUser(clan, eventButtonClick.user_id),
    ])
    const menuOwnerName = this.mezonClientService.getUserDisplayName(menuOwner)
    const buttonClickerName = this.mezonClientService.getUserDisplayName(buttonClicker)

    switch (type as EOrderActionButton) {
      case EOrderActionButton.Cancel:
        await this.handleCancelAction(
          orderId,
          buttonClicker.id,
          buttonClickerName,
          menuOwnerName,
          order.menu,
          clan,
          reportMessage,
        )
        break
      default:
        this.logger.error(`Invalid order button click type: ${type}`)
    }
  }

  // ============================================================================
  // CANCEL ACTION LOGIC
  // ============================================================================

  private async handleCancelAction(
    orderId: string,
    buttonClickerId: string,
    buttonClickerName: string,
    menuOwnerName: string,
    menu: Menu,
    clan: Clan,
    reportMessage: Message,
  ): Promise<void> {
    await this.orderService.createDatabaseTransaction(async transactionManager => {
      const userOrderItems = await this.orderService.getOrderItemsByOrderIdAndUserId(
        transactionManager,
        orderId,
        buttonClickerId,
      )

      if (userOrderItems.length === 0) {
        this.logger.warn(`No order items found for user ${buttonClickerId} in order ${orderId}`)
        return
      }

      const orderItemIds = userOrderItems.map(item => item.id)
      await this.orderService.softDeleteOrderItems(transactionManager, orderItemIds)

      const remainingOrderItems = await this.orderService.getOrderItemsByMenuId(
        transactionManager,
        menu.id,
      )

      await this.updateOrderReportMessage(
        remainingOrderItems,
        orderId,
        menuOwnerName,
        clan,
        reportMessage,
      )

      await this.sendCancelNotification(reportMessage, buttonClickerId, buttonClickerName)
    })
  }

  private async updateOrderReportMessage(
    orderItems: OrderItem[],
    orderId: string,
    menuOwnerName: string,
    clan: Clan,
    reportMessage: Message,
  ): Promise<void> {
    const reportContent = await this.generateOrderReportContent(
      orderItems,
      orderId,
      menuOwnerName,
      clan,
    )

    await reportMessage.update(reportContent)
  }

  private async sendCancelNotification(
    reportMessage: Message,
    buttonClickerId: string,
    buttonClickerName: string,
  ): Promise<void> {
    const mentionText = `@${buttonClickerName}`
    const actionText = ` đã hủy đơn thành công`
    const fullNotificationText = `${mentionText}${actionText}`

    const notificationContent: ChannelMessageContent = {
      t: fullNotificationText,
    }

    const mentionData = {
      user_id: buttonClickerId,
      s: 0,
      e: mentionText.length,
    }

    await reportMessage.reply(notificationContent, [mentionData])
  }
}
