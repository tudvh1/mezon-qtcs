import { Command } from '@/modules/bot/common/decorators'
import { IMessageContext } from '@/modules/mezon-client/message.interface'
import { BaseCommand } from '../command.base'

@Command('anlau')
export class AnlauCommand extends BaseCommand {
  constructor() {
    super()
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    const { message } = messageContext
    await message.reply({}, undefined, [
      {
        url: 'https://cdn.mezon.vn/0/0/1832959783649415200/1742974929220_undefinedanlau.jpg',
        filetype: 'image/jpeg',
      },
    ])
  }
}

@Command('anhtraisayhai')
export class AnhtraisayhaiCommand extends BaseCommand {
  constructor() {
    super()
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    const { message } = messageContext
    await message.reply({}, undefined, [
      {
        filename: 'anhtraisayhai.mp4',
        size: 7668484,
        url: 'https://cdn.mezon.ai/1840661519625359360/1840699873679118336/1832959783649415200/1751968440862_anhtraisayhai.mp4',
        filetype: 'video/mp4',
        width: 1080,
        height: 1080,
      },
    ])
  }
}

@Command('chuataidau')
export class ChuataidauCommand extends BaseCommand {
  constructor() {
    super()
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    const { message } = messageContext
    await message.reply({}, undefined, [
      {
        filename: 'chuataidau.mp4',
        size: 5349244,
        url: 'https://cdn.mezon.ai/1840661519625359360/1840699873679118336/1832959783649415200/1751968533710_chuataidau.mp4',
        filetype: 'video/mp4',
        width: 966,
        height: 1920,
      },
    ])
  }
}

@Command('cheosup')
export class CheosupCommand extends BaseCommand {
  constructor() {
    super()
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    const { message } = messageContext
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

@Command('nhac2k8')
export class Nhac2k8Command extends BaseCommand {
  constructor() {
    super()
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    const { message } = messageContext
    await message.reply({}, undefined, [
      {
        filename: 'dao ly 2.mp4',
        size: 18215612,
        url: 'https://cdn.mezon.ai/1840661519625359360/1840665473318916096/1832959783649415200/1751291397738_dao_ly_2.mp4',
        filetype: 'video/mp4',
        width: 1080,
        height: 1440,
      },
    ])
  }
}
