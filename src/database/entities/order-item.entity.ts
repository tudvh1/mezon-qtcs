import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { BaseEntity } from './base.entity'
import { MenuDish } from './menu-dish.entity'
import { Order } from './order.entity'

@Entity({ name: 'order_items' })
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', length: 36, name: 'order_id' })
  orderId: string

  @Column({ type: 'uuid', length: 36, name: 'menu_dish_id' })
  menuDishId: string

  @Column({ type: 'int', name: 'quantity', default: 1 })
  quantity: number

  @Column({ type: 'text', name: 'note', nullable: true })
  note: string | null

  @ManyToOne(() => Order, order => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ManyToOne(() => MenuDish, menuDish => menuDish.orderItems)
  @JoinColumn({ name: 'menu_dish_id' })
  menuDish: MenuDish
}
