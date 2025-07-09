import { Clan } from 'mezon-sdk/dist/cjs/mezon-client/structures/Clan'
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message'
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel'

export interface IMessageContext {
  clan: Clan
  channel: TextChannel
  message: Message
}
