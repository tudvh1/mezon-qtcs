import { Injectable, Logger } from '@nestjs/common'
import { MezonClient } from 'mezon-sdk'
import { Clan } from 'mezon-sdk/dist/cjs/mezon-client/structures/Clan'
import { Message } from 'mezon-sdk/dist/cjs/mezon-client/structures/Message'
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel'
import { User } from 'mezon-sdk/dist/cjs/mezon-client/structures/User'

import { TypedConfigService } from '../typed-config/typed-config.service'
import { IMessageContext } from './message.interface'

@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name)
  private mezonClient: MezonClient
  private retryCount = 0

  constructor(private readonly configService: TypedConfigService) {
    this.mezonClient = new MezonClient(this.configService.get('mezon.token'))
    void this.initializeClient()
  }

  public getMezonClient(): MezonClient {
    return this.mezonClient
  }

  public async initializeClient() {
    try {
      const result = await this.mezonClient.login()
      this.logger.log(`Mezon client authenticated. ${result}`)
      this.retryCount = 0 // Reset retry count on success
    } catch (error) {
      this.retryCount++
      const delay = Math.pow(2, this.retryCount - 1) * 1000
      this.logger.error(`Error authenticating mezon client: ${error.message}`, error)
      this.logger.log(`Retrying to authenticate mezon client in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      void this.initializeClient()
    }
  }

  public async getMessageContext(
    clanId: string | undefined,
    channelId: string | undefined,
    messageId: string | undefined,
  ): Promise<IMessageContext> {
    if (!clanId || !channelId || !messageId) {
      throw new Error('Invalid message parameters')
    }

    const clan = this.mezonClient.clans.get(clanId)
    if (!clan) {
      throw new Error('Clan not found')
    }

    const channel = await clan.channels.fetch(channelId)
    if (!channel) {
      throw new Error('Channel not found')
    }

    const message = await channel.messages.fetch(messageId)
    if (!message) {
      throw new Error('Message not found')
    }

    return {
      clan,
      channel,
      message,
    }
  }

  public async fetchChannel(clanId: string, channelId: string): Promise<TextChannel> {
    const clan = this.mezonClient.clans.get(clanId)
    if (!clan) {
      throw new Error('Clan not found')
    }

    const channel = await clan.channels.fetch(channelId)
    if (!channel) {
      throw new Error('Channel not found')
    }

    return channel
  }

  public async fetchMessage(channel: TextChannel, messageId: string): Promise<Message> {
    const message = await channel.messages.fetch(messageId)
    if (!message) {
      throw new Error('Message not found')
    }
    return message
  }

  public async fetchUser(clan: Clan, userId: string): Promise<User> {
    const user = await clan.users.fetch(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  public getUserDisplayName(user: User): string {
    return user.clan_nick || user.display_name || user.username || 'Unknown'
  }
}
