import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'

import { Menu, MenuDish } from '@/database/entities'
import { IMenuResponse } from '@/modules/puppeteer/interfaces/shopee'
import { IMenuCreatePayload } from './interfaces'

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name)

  constructor(
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuDish) private readonly menuDishRepository: Repository<MenuDish>,
  ) {}

  public async createDatabaseTransaction(
    callback: (transactionManager: EntityManager) => Promise<void>,
  ): Promise<void> {
    return this.menuRepository.manager.transaction(callback)
  }

  public async createMenu(
    transactionManager: EntityManager,
    payload: IMenuCreatePayload,
  ): Promise<Menu> {
    const menu = transactionManager.create(Menu, {
      clanId: payload.clanId,
      channelId: payload.channelId,
      messageId: payload.messageId,
      storeUrl: payload.storeUrl,
      storeName: payload.storeName,
      storeType: payload.storeType,
      ownerId: payload.ownerId,
    })
    await transactionManager.save(menu)

    const allDishes = payload.menuData.flatMap(category =>
      category.dishes.filter(dish => dish.is_deleted === false && dish.is_available === true),
    )
    const uniqueDishesMap = new Map<number, IMenuResponse['reply']['menu_infos'][0]['dishes'][0]>()
    allDishes.forEach(dish => {
      if (!uniqueDishesMap.has(dish.id)) {
        uniqueDishesMap.set(dish.id, dish)
      }
    })
    const uniqueDishes = Array.from(uniqueDishesMap.values())

    const menuDishes = uniqueDishes.map(dish =>
      transactionManager.create(MenuDish, {
        menuId: menu.id,
        dishId: dish.id.toString(),
        dishName: dish.name,
        dishImageUrl: dish.photos[dish.photos.length - 1].value,
        dishPrice: dish.price.value.toString(),
        dishDiscountPrice: dish.discount_price?.value.toString() || undefined,
      }),
    )
    await transactionManager.save(menuDishes)

    menu.menuDishes = menuDishes
    return menu
  }

  public async getMenu(menuId: string): Promise<Menu | null> {
    return await this.menuRepository.findOne({
      where: {
        id: menuId,
        isClosed: false,
      },
    })
  }

  public async getMenuDish(menuId: string, menuDishId: string): Promise<MenuDish | null> {
    return await this.menuDishRepository.findOne({
      where: {
        id: menuDishId,
        menu: {
          id: menuId,
          isClosed: false,
        },
      },
    })
  }

  public async updateMenuReportMessageId(
    transactionManager: EntityManager,
    menuId: string,
    reportMessageId: string,
  ): Promise<void> {
    await transactionManager.update(
      Menu,
      {
        id: menuId,
        isClosed: false,
      },
      {
        reportMessageId,
      },
    )
  }

  public async updateMenuCloseConfirmMessageId(
    transactionManager: EntityManager,
    menuId: string,
    closeConfirmMessageId: string | null,
  ): Promise<void> {
    await transactionManager.update(
      Menu,
      {
        id: menuId,
      },
      {
        closeConfirmMessageId,
      },
    )
  }

  public async closeMenu(transactionManager: EntityManager, menuId: string): Promise<void> {
    await transactionManager.update(
      Menu,
      {
        id: menuId,
      },
      {
        isClosed: true,
      },
    )
  }
}
