import { Logger } from '@nestjs/common'
import { EMarkdownType, IEmbedProps } from 'mezon-sdk'
import { HTTPResponse, Page } from 'puppeteer'

import { COLORS, LUNCH_STORE_RANDOM_TIMES, LUNCH_STORE_URLS } from '@/modules/bot/common/constants'
import { Command } from '@/modules/bot/common/decorators'
import { randomArrayItem, randomMultipleTimes } from '@/modules/bot/common/utils'
import { IMessageContext } from '@/modules/mezon-client/message.interface'
import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'
import { IShopeeStoreResponse } from '@/modules/puppeteer/interfaces/shopee'
import { PuppeteerService } from '@/modules/puppeteer/puppeteer.service'
import { BaseCommand } from '../command.base'

@Command('truanayangi')
export class TruanayangiCommand extends BaseCommand {
  private readonly logger = new Logger(TruanayangiCommand.name)
  private usedStoreLinks: string[] = []

  constructor(
    private readonly mezonClientService: MezonClientService,
    private readonly puppeteerService: PuppeteerService,
  ) {
    super()
  }

  private async extractStoreInfo(
    page: Page,
    link: string,
  ): Promise<IShopeeStoreResponse['reply']['delivery_detail'] | null> {
    return new Promise(resolve => {
      const runAsync = async () => {
        try {
          const apiUrlPattern = 'get_detail'

          const timeoutId: NodeJS.Timeout = setTimeout(() => {
            if (!isResolved) {
              isResolved = true
              page.removeAllListeners('response')
              resolve(null)
            }
          }, 30000)

          let isResolved = false

          const handleResponse = async (response: HTTPResponse) => {
            try {
              if (isResolved) return

              const responseUrl = response.url()
              const request = response.request()
              if (request.method() === 'OPTIONS') return

              const contentType = response.headers()['content-type'] || ''
              if (responseUrl.includes(apiUrlPattern) && contentType.includes('application/json')) {
                const responseBody = (await response.json()) as IShopeeStoreResponse
                isResolved = true
                clearTimeout(timeoutId)
                page.removeAllListeners('response')
                resolve(responseBody.reply.delivery_detail)
              }
            } catch (error) {
              this.logger.error(`Error handle response: ${error.message}`, error)
              resolve(null)
            }
          }

          page.on('response', (response: HTTPResponse) => {
            handleResponse(response).catch(error => {
              this.logger.error(`Error in handleResponse: ${error.message}`, error)
            })
          })

          await page.goto(link)
        } catch (error) {
          this.logger.error(`Error extract store info: ${error.message}`, error)
          resolve(null)
        }
      }

      void runAsync()
    })
  }

  private createEmbed(store: IShopeeStoreResponse['reply']['delivery_detail']): IEmbedProps[] {
    const descriptionParts = [`🍽️ ${store.name}`]

    if (store.address) {
      descriptionParts.push(`📍 ${store.address}`)
    }

    if (store.rating?.avg) {
      const ratingInfo = `⭐ ${store.rating.avg}`
      const reviewCount = store.rating.total_review
        ? ` (${store.rating.total_review} đánh giá)`
        : ''
      descriptionParts.push(`${ratingInfo}${reviewCount}`)
    }

    if (store.delivery?.is_open) {
      descriptionParts.push('🟢 Đang mở cửa')
    } else {
      descriptionParts.push('🔴 Đóng cửa')
    }

    if (store.categories?.length) {
      const categories = store.categories.slice(0, 3).join(', ')
      descriptionParts.push(`🍴 ${categories}`)
    }

    const description = descriptionParts.filter(Boolean).join('\n')

    return [
      {
        color: randomArrayItem(COLORS),
        title: '🍜 TRƯA NAY ĂN GÌ?',
        description,
        thumbnail: store.photos?.length
          ? { url: store.photos[store.photos.length - 1].value }
          : undefined,
      },
    ]
  }

  public async execute(args: string[], messageContext: IMessageContext): Promise<void> {
    if (LUNCH_STORE_URLS.length <= this.usedStoreLinks.length) {
      const halfLength = Math.floor(this.usedStoreLinks.length / 2)
      this.usedStoreLinks = this.usedStoreLinks.slice(halfLength)
    }

    const storeUrl = randomMultipleTimes(
      LUNCH_STORE_URLS,
      LUNCH_STORE_RANDOM_TIMES,
      this.usedStoreLinks,
    )
    this.usedStoreLinks.push(storeUrl)

    const { channel, message } = messageContext

    const messageContent = '🔃 Đang tải thông tin quán...'
    const replyMessageId = (
      await message.reply({
        t: `${storeUrl}${messageContent}`,
        mk: [
          { type: EMarkdownType.LINK, e: storeUrl.length },
          {
            type: EMarkdownType.PRE,
            s: storeUrl.length,
            e: storeUrl.length + messageContent.length,
          },
        ],
      })
    ).message_id

    const replyMessage = await this.mezonClientService.fetchMessage(channel, replyMessageId)

    const browser = await this.puppeteerService.createBrowser()
    const page = await browser.newPage()

    try {
      const store = await this.extractStoreInfo(page, storeUrl)

      if (!store) {
        const messageContent = '❌ Có lỗi khi lấy thông tin quán. Vui lòng thử lại sau!'
        await replyMessage.update({
          t: `${storeUrl}${messageContent}`,
          mk: [
            { type: EMarkdownType.LINK, e: storeUrl.length },
            {
              type: EMarkdownType.PRE,
              s: storeUrl.length,
              e: storeUrl.length + messageContent.length,
            },
          ],
        })
        return
      }

      await replyMessage.update({
        t: storeUrl,
        mk: [{ type: EMarkdownType.LINK, e: storeUrl.length }],
        embed: this.createEmbed(store),
      })
    } catch (error) {
      this.logger.error(`Error in handle store info: ${error.message}`, error)

      const messageContent = '❌ Có lỗi khi hiển thị thông tin quán. Vui lòng thử lại sau!'
      await replyMessage.update({
        t: `${storeUrl}${messageContent}`,
        mk: [
          { type: EMarkdownType.LINK, e: storeUrl.length },
          {
            type: EMarkdownType.PRE,
            s: storeUrl.length,
            e: storeUrl.length + messageContent.length,
          },
        ],
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
