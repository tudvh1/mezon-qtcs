import { IMessageContext } from '@/modules/mezon-client/message.interface'

export abstract class BaseCommand {
  constructor() {}

  abstract execute(args: string[], messageContext: IMessageContext): Promise<void>
}
