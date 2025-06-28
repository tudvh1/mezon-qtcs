import { Logger } from '@nestjs/common'
import {
  ChannelMessage,
  ChannelMessageContent,
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
  IMessageActionRow,
} from 'mezon-sdk'
import { HTTPResponse, Page } from 'puppeteer'

import { Menu } from '@/database/entities'
import { Command } from '@/modules/bot/common/decorators'
import { EMenuActionButton, EMenuFormName, EMenuStoreType } from '@/modules/menu/menu.enum'
import { MenuService } from '@/modules/menu/menu.service'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { IMenuResponse, IShopeeStoreResponse } from '@/modules/puppeteer/interfaces/shopee'
import { PuppeteerService } from '@/modules/puppeteer/puppeteer.service'
import { COLORS } from '../../../common/constants'
import { formatPrice, makeStrikethroughString, randomArrayItem } from '../../../common/utils'
import { BaseCommand } from '../command.base'

@Command('smenu')
export class MenuCommand extends BaseCommand {
  private readonly logger = new Logger(MenuCommand.name)

  constructor(
    private readonly mezonClientService: MezonClientService,
    private readonly puppeteerService: PuppeteerService,
    private readonly menuService: MenuService,
  ) {
    super()
  }

  private async extractMenuAndStoreInfo(
    page: Page,
    url: string,
  ): Promise<{
    menuData: IMenuResponse['reply']['menu_infos'] | null
    storeData: IShopeeStoreResponse['reply']['delivery_detail'] | null
  }> {
    return new Promise(resolve => {
      const runAsync = async () => {
        try {
          const menuApiPattern = 'get_delivery_dishes'
          const storeApiPattern = 'get_detail'

          const timeoutId: NodeJS.Timeout = setTimeout(() => {
            if (!isResolved) {
              isResolved = true
              page.removeAllListeners('response')
              resolve({ menuData, storeData })
            }
          }, 30000)

          let isResolved = false
          let menuData: IMenuResponse['reply']['menu_infos'] | null = null
          let storeData: IShopeeStoreResponse['reply']['delivery_detail'] | null = null

          const handleResponse = async (response: HTTPResponse) => {
            try {
              if (isResolved) return

              const responseUrl = response.url()
              const request = response.request()
              if (request.method() === 'OPTIONS') return

              const contentType = response.headers()['content-type'] || ''
              if (!contentType.includes('application/json')) return

              if (responseUrl.includes(menuApiPattern)) {
                const responseBody = (await response.json()) as IMenuResponse
                menuData = responseBody.reply.menu_infos
                this.logger.log('Menu data received')
              } else if (responseUrl.includes(storeApiPattern)) {
                const responseBody = (await response.json()) as IShopeeStoreResponse
                storeData = responseBody.reply.delivery_detail
                this.logger.log('Store data received')
              }

              if (menuData && storeData) {
                isResolved = true
                clearTimeout(timeoutId)
                page.removeAllListeners('response')
                resolve({ menuData, storeData })
              }
            } catch (error) {
              this.logger.error(`Error handle response: ${error.message}`, error)
              resolve({ menuData: null, storeData: null })
            }
          }

          page.on('response', (response: HTTPResponse) => {
            handleResponse(response).catch(error => {
              this.logger.error(`Error in handleResponse: ${error.message}`, error)
            })
          })

          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          })
        } catch (error) {
          this.logger.error(`Error extract menu and store info: ${error.message}`, error)
          resolve({ menuData: null, storeData: null })
        }
      }

      void runAsync()
    })
  }

  private createEmbed(menu: Menu, eventMessage: ChannelMessage) {
    return [
      {
        color: randomArrayItem(COLORS),
        title: `🍽️ ${menu.storeName}`,
        description: 'Các món ăn/đồ uống đã hết sẽ bị ẩn.',
        fields: [
          {
            name: '',
            value: '',
            inputs: {
              id: EMenuFormName.DishIds,
              type: EMessageComponentType.RADIO,
              component: menu.menuDishes.map(item => ({
                label: `${item.dishName}`,
                value: `${item.id}`,
                description: item.dishDiscountPrice
                  ? `${formatPrice(item.dishDiscountPrice)} - ${makeStrikethroughString(formatPrice(item.dishPrice))}`
                  : `${formatPrice(item.dishPrice)}`,
                style: EButtonMessageStyle.SUCCESS,
              })),
            },
          },
          {
            name: '',
            value: '',
            inputs: {
              id: EMenuFormName.Note,
              type: EMessageComponentType.INPUT,
              component: {
                placeholder: 'Note...',
                textarea: true,
              },
            },
          },
        ],
        footer: {
          text: `Được tạo bởi ${this.mezonClientService.getUserDisplayName(eventMessage)}`,
          icon_url: eventMessage.clan_avatar || eventMessage.avatar,
        },
      },
    ]
  }

  private createComponents(menuId: string): IMessageActionRow[] {
    return [
      {
        components: [
          {
            id: `menu_${menuId}_${EMenuActionButton.CloseConfirm}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: 'Đóng menu',
              style: EButtonMessageStyle.SECONDARY,
            },
          },
          {
            id: `menu_${menuId}_${EMenuActionButton.Order}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: 'Đặt món',
              style: EButtonMessageStyle.SUCCESS,
            },
          },
        ],
      },
    ]
  }

  public async execute(args: string[], eventMessage: ChannelMessage): Promise<void> {
    this.logger.log('Execute menu command')

    const { clan, channel, message } = await this.mezonClientService.getMessageWithContext(
      eventMessage.clan_id,
      eventMessage.channel_id,
      eventMessage.id,
    )

    if (args.length < 1 || !args[0]) {
      const messageContent = 'Vui lòng nhập link hợp lệ...'
      await message.reply({
        t: `${messageContent}`,
        mk: [{ type: EMarkdownType.PRE, e: messageContent.length }],
      })
      return
    }

    const storeUrl = args[0]
    try {
      new URL(storeUrl)
    } catch {
      const messageContent = '❌ Link không hợp lệ. Vui lòng kiểm tra lại!'
      await message.reply({
        t: `${messageContent}`,
        mk: [{ type: EMarkdownType.PRE, e: messageContent.length }],
      })
      return
    }

    const messageContent = '🔃 Đang tạo menu...'
    const replyMessageId = (
      await message.reply({
        t: `${messageContent}`,
        mk: [{ type: EMarkdownType.PRE, e: messageContent.length }],
      })
    ).message_id

    const replyMessage = await this.mezonClientService.fetchMessage(channel, replyMessageId)

    const browser = await this.puppeteerService.createBrowser()
    const page = await browser.newPage()

    try {
      const { menuData, storeData } = await this.extractMenuAndStoreInfo(page, storeUrl)

      if (!menuData || !storeData) {
        const errorMessage = '❌ Không thể tạo menu. Vui lòng kiểm tra link hoặc thử lại sau!'
        await replyMessage.update({
          t: `${errorMessage}`,
          mk: [{ type: EMarkdownType.PRE, e: errorMessage.length }],
        })
        return
      }

      await this.menuService.createDatabaseTransaction(async transactionManager => {
        const menu = await this.menuService.createMenu(transactionManager, {
          clanId: clan.id,
          channelId: channel.id || '',
          messageId: replyMessageId,
          storeUrl,
          storeName: storeData.name,
          storeType: EMenuStoreType.ShopeeFood,
          ownerId: eventMessage.sender_id,
          menuData,
        })

        const embed = this.createEmbed(menu, eventMessage)
        const components = this.createComponents(menu.id)
        const dataSend: ChannelMessageContent = {
          embed,
          components,
        }

        const dataSendLength = JSON.stringify(dataSend).length
        if (dataSendLength > 7000) {
          this.logger.log(`menu content length: ${dataSendLength}`)
          const errorMessage = '❌ Không thể tạo menu do quá dài. Vui lòng chọn link khác!'
          await replyMessage.update({
            t: `${errorMessage}`,
            mk: [{ type: EMarkdownType.PRE, e: errorMessage.length }],
          })
          return
        }

        await replyMessage.update(dataSend)
      })
    } catch (error) {
      this.logger.error(`Error in handle menu creation: ${error.message}`, error)

      const errorMessage = '❌ Có lỗi khi tạo menu. Vui lòng thử lại sau!'
      await replyMessage.update({
        t: `${errorMessage}`,
        mk: [{ type: EMarkdownType.PRE, e: errorMessage.length }],
      })
    } finally {
      try {
        await page.close()
        await this.puppeteerService.closeBrowser(browser)
      } catch (error) {
        this.logger.error(`Error closing browser: ${error.message}`, error)
      }
    }
  }
}
