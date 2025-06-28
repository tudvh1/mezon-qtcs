import { ChannelMessage } from 'mezon-sdk'

export abstract class BaseCommand {
  constructor() {}

  abstract execute(args: string[], eventMessage: ChannelMessage): Promise<void>
}
