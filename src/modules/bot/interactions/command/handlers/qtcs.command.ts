import { ChannelMessage } from 'mezon-sdk'

import { Command } from '@/modules/bot/common/decorators'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { Logger } from '@nestjs/common'
import { BaseCommand } from '../command.base'

@Command('qtcs')
export class QtcsCommand extends BaseCommand {
  private readonly logger = new Logger(QtcsCommand.name)

  constructor(private readonly mezonClientService: MezonClientService) {
    super()
  }

  public async execute(args: string[], eventMessage: ChannelMessage): Promise<void> {
    this.logger.log('Execute qtcs command')

    const { message } = await this.mezonClientService.getMessageWithContext(
      eventMessage.clan_id,
      eventMessage.channel_id,
      eventMessage.id,
    )

    await message.reply({}, undefined, [
      {
        filename: 'dao ly 1.mp4',
        size: 28859135,
        url: 'https://cdn.mezon.ai/1840661519625359360/1840665473318916096/1832959783649415200/1751295505998_dao_ly_1.mp4',
        filetype: 'video/mp4',
        width: 1080,
        height: 1920,
      },
    ])
  }
}
