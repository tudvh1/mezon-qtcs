import {
  ChannelMessageContent,
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
} from 'mezon-sdk'
import { Clan } from 'mezon-sdk/dist/cjs/mezon-client/structures/Clan'
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime'

import { OrderItem } from '@/database/entities'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { EOrderActionButton } from '@/modules/order/order.enum'
import { OrderService } from '@/modules/order/order.service'
import { formatPrice } from '../../common/utils'

export abstract class BaseButtonClick {
  constructor(
    protected readonly mezonClientService: MezonClientService,
    protected readonly orderService: OrderService,
  ) {}

  public abstract execute(args: string[], eventButtonClick: MessageButtonClicked): Promise<void>

  protected async generateOrderReportContent(
    orderItems: OrderItem[],
    orderId: string,
    menuOwnerName: string,
    clan: Clan,
  ): Promise<ChannelMessageContent> {
    if (orderItems.length === 0) {
      return this.generateEmptyOrderReportContent(orderId, menuOwnerName)
    }

    const userOrdersMap = this.groupOrderItemsByUser(orderItems)
    const userReportSections: string[] = []

    for (const [userId, userOrderItems] of userOrdersMap) {
      const user = await this.mezonClientService.fetchUser(clan, userId)
      const displayName = this.mezonClientService.getUserDisplayName(user)
      const orderSummary = await this.orderService.getMultipleOrderItemsSummary(userOrderItems)

      const userHeader = `🙋‍♂️ <${displayName}>`
      const orderDetails = orderSummary.contexts.join('\n')
      const totalPrice = `💰 Tổng: ${formatPrice(orderSummary.totalPrice)}`

      const userSection = `${userHeader}\n${orderDetails}\n${totalPrice}`
      userReportSections.push(userSection)
    }

    const reportBody = userReportSections.join('\n\n')
    const mentionPrefix = `@${menuOwnerName}`
    const reportHeader = '📋 ORDER REPORT\n\n'
    const fullReportText = `${mentionPrefix}${reportHeader}${reportBody}`

    return {
      t: fullReportText,
      mk: [
        {
          type: EMarkdownType.PRE,
          s: mentionPrefix.length,
          e: fullReportText.length,
        },
      ],
      components: [
        {
          components: [
            {
              id: `order_${orderId}_${EOrderActionButton.Cancel}`,
              type: EMessageComponentType.BUTTON,
              component: {
                label: 'Hủy đặt',
                style: EButtonMessageStyle.DANGER,
              },
            },
          ],
        },
      ],
    }
  }

  private generateEmptyOrderReportContent(
    orderId: string,
    menuOwnerName: string,
  ): ChannelMessageContent {
    const mentionPrefix = `@${menuOwnerName}`
    const reportHeader = '📋 ORDER REPORT\n\n'
    const emptyMessage = '❌ Chưa có ai đặt!'
    const fullReportText = `${mentionPrefix}${reportHeader}${emptyMessage}`

    return {
      t: fullReportText,
      mk: [
        {
          type: EMarkdownType.PRE,
          s: mentionPrefix.length,
          e: fullReportText.length,
        },
      ],
      components: [
        {
          components: [
            {
              id: `order_${orderId}_${EOrderActionButton.Cancel}`,
              type: EMessageComponentType.BUTTON,
              component: {
                label: 'Hủy đặt',
                style: EButtonMessageStyle.DANGER,
              },
            },
          ],
        },
      ],
    }
  }

  public groupOrderItemsByUser(orderItems: OrderItem[]): Map<string, OrderItem[]> {
    const userOrdersMap = new Map<string, OrderItem[]>()

    for (const orderItem of orderItems) {
      const userId = orderItem.order.userId

      if (!userOrdersMap.has(userId)) {
        userOrdersMap.set(userId, [])
      }

      userOrdersMap.get(userId)!.push(orderItem)
    }

    return userOrdersMap
  }
}
