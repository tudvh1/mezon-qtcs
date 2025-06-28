import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { BaseEntity } from './base.entity'
import { Menu } from './menu.entity'
import { OrderItem } from './order-item.entity'

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', length: 36, name: 'menu_id' })
  menuId: string

  @Column({ type: 'varchar', length: 50, name: 'user_id' })
  userId: string

  @ManyToOne(() => Menu, menu => menu.orders)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[]
}
