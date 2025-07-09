import { EMarkdownType } from 'mezon-sdk'

import { Command } from '@/modules/bot/common/decorators'
import { IMessageContext } from '@/modules/mezon-client/message.interface'
import { BaseCommand } from '../command.base'

@Command('qtcs')
export class QtcsCommand extends BaseCommand {
  constructor() {
    super()
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    const { message } = messageContext

    const messageContent = `🍽️ FOOD:
truanayangi: Gợi ý quán cho bữa trưa của bạn
smenu [shopeefood url]: Tạo menu đặt món nhanh chóng từ ShopeeFood

😂 MEME:
anlau, anhtraisayhai, chuataidau, cheosup, nhac2k8`

    await message.reply({
      t: messageContent,
      mk: [{ type: EMarkdownType.PRE, e: messageContent.length }],
    })
  }
}
