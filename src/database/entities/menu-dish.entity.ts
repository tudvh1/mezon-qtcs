import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { BaseEntity } from './base.entity'
import { Menu } from './menu.entity'
import { OrderItem } from './order-item.entity'

@Entity({ name: 'menu_dishes' })
export class MenuDish extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', length: 36, name: 'menu_id' })
  menuId: string

  @Column({ type: 'varchar', length: 50, name: 'dish_id' })
  dishId: string

  @Column({ type: 'varchar', length: 255, name: 'dish_name' })
  dishName: string

  @Column({ type: 'text', name: 'dish_image_url' })
  dishImageUrl: string

  @Column({ type: 'varchar', length: 255, name: 'dish_price' })
  dishPrice: string

  @Column({ type: 'varchar', length: 255, name: 'dish_discount_price', nullable: true })
  dishDiscountPrice: string | null

  @ManyToOne(() => Menu, menu => menu.menuDishes)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu

  @OneToMany(() => OrderItem, orderItem => orderItem.menuDish)
  orderItems: OrderItem[]
}
