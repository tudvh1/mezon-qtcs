import { IMenuResponse } from '@/modules/puppeteer/interfaces/shopee'
import { EMenuStoreType } from '../menu.enum'

export interface IMenuCreatePayload {
  clanId: string
  channelId: string
  messageId: string
  storeUrl: string
  storeName: string
  storeType: EMenuStoreType
  ownerId: string
  menuData: IMenuResponse['reply']['menu_infos']
}
