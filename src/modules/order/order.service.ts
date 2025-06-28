import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import BigNumber from 'bignumber.js'
import { EntityManager, In, Repository } from 'typeorm'

import { MenuDish, Order, OrderItem } from '@/database/entities'
import { formatPrice, makeStrikethroughString } from '../bot/common/utils'
import {
  IMultipleOrderItemsSummary,
  IOrderCreatePayload,
  IOrderItemCreatePayload,
} from './interfaces'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(MenuDish) private readonly menuDishRepository: Repository<MenuDish>,
  ) {}

  public async createDatabaseTransaction(
    callback: (transactionManager: EntityManager) => Promise<void>,
  ): Promise<void> {
    return this.orderRepository.manager.transaction(callback)
  }

  public async createOrder(
    transactionManager: EntityManager,
    payload: IOrderCreatePayload,
  ): Promise<Order> {
    let order = await transactionManager.findOne(Order, {
      where: {
        menuId: payload.menuId,
        userId: payload.userId,
      },
    })

    if (!order) {
      order = transactionManager.create(Order, {
        menuId: payload.menuId,
        userId: payload.userId,
      })
    }

    await transactionManager.save(order)

    return order
  }

  public async createOrderItem(
    transactionManager: EntityManager,
    orderId: string,
    payload: IOrderItemCreatePayload,
  ): Promise<OrderItem> {
    let orderItem = await transactionManager.findOne(OrderItem, {
      where: {
        orderId,
        menuDishId: payload.menuDishId,
      },
    })

    if (orderItem) {
      orderItem.quantity += 1
      orderItem.note = payload.note || null
    } else {
      orderItem = transactionManager.create(OrderItem, {
        orderId,
        menuDishId: payload.menuDishId,
        note: payload.note,
      })
    }

    await transactionManager.save(orderItem)

    return orderItem
  }

  public async getOrderWithMenu(orderId: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        menu: true,
      },
    })
  }

  public async getOrderItemsByMenuId(
    transactionManager: EntityManager,
    menuId: string,
  ): Promise<OrderItem[]> {
    return await transactionManager.find(OrderItem, {
      where: {
        order: {
          menuId,
        },
      },
      relations: {
        order: true,
      },
      order: {
        createdAt: 'ASC',
      },
    })
  }

  public async getOrderItemsByOrderIdAndUserId(
    transactionManager: EntityManager,
    orderId: string,
    userId: string,
  ): Promise<OrderItem[]> {
    return await transactionManager.find(OrderItem, {
      where: {
        order: {
          id: orderId,
          userId: userId,
        },
      },
      relations: {
        order: true,
      },
    })
  }

  public async getSingleOrderItemSummary(orderItem: OrderItem): Promise<string> {
    const menuDish = await this.menuDishRepository.findOne({
      where: {
        id: orderItem.menuDishId,
      },
    })

    if (!menuDish) {
      return ''
    }

    const priceDisplay = menuDish.dishDiscountPrice
      ? `${formatPrice(menuDish.dishDiscountPrice)} - ${makeStrikethroughString(formatPrice(menuDish.dishPrice))}`
      : formatPrice(menuDish.dishPrice)
    const note = orderItem.note ? ` [Note: ${orderItem.note}]` : ''

    return `${menuDish.dishName} [${priceDisplay}]${note}`
  }

  public async getMultipleOrderItemsSummary(
    orderItems: OrderItem[],
  ): Promise<IMultipleOrderItemsSummary> {
    if (orderItems.length === 0) {
      return {
        contexts: [],
        totalPrice: '0',
      }
    }

    const menuDishIds = orderItems.map(item => item.menuDishId)
    const menuDishes = await this.menuDishRepository.find({
      where: {
        id: In(menuDishIds),
      },
    })

    // Create a map for quick lookup
    const menuDishMap = new Map<string, MenuDish>()
    menuDishes.forEach(dish => {
      menuDishMap.set(dish.id, dish)
    })

    const contexts: string[] = []
    let total = new BigNumber(0)

    for (const item of orderItems) {
      const menuDish = menuDishMap.get(item.menuDishId)
      if (!menuDish) {
        continue
      }

      const priceDisplay = menuDish.dishDiscountPrice
        ? `${formatPrice(menuDish.dishDiscountPrice)} - ${makeStrikethroughString(formatPrice(menuDish.dishPrice))}`
        : formatPrice(menuDish.dishPrice)
      const note = item.note ? ` [Note: ${item.note}]` : ''

      contexts.push(`- ${item.quantity}x ${menuDish.dishName} [${priceDisplay}]${note}`)

      // Calculate total price
      const price = menuDish.dishDiscountPrice || menuDish.dishPrice
      const itemTotal = new BigNumber(price).times(item.quantity)
      total = total.plus(itemTotal)
    }

    return {
      contexts,
      totalPrice: total.toString(),
    }
  }

  public async softDeleteOrderItems(
    transactionManager: EntityManager,
    orderItemIds: string[],
  ): Promise<void> {
    await transactionManager.softDelete(OrderItem, orderItemIds)
  }
}
