import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { EMenuStoreType } from '@/modules/menu/menu.enum'
import { BaseEntity } from './base.entity'
import { MenuDish } from './menu-dish.entity'
import { Order } from './order.entity'

@Entity({ name: 'menus' })
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50, name: 'clan_id' })
  clanId: string

  @Column({ type: 'varchar', length: 50, name: 'channel_id' })
  channelId: string

  @Column({ type: 'varchar', length: 50, name: 'message_id' })
  messageId: string

  @Column({ type: 'varchar', length: 50, name: 'report_message_id', nullable: true })
  reportMessageId: string | null

  @Column({ type: 'varchar', length: 50, name: 'close_confirm_message_id', nullable: true })
  closeConfirmMessageId: string | null

  @Column({ type: 'text', name: 'store_url' })
  storeUrl: string

  @Column({ type: 'varchar', length: 255, name: 'store_name' })
  storeName: string

  @Column({ type: 'tinyint', name: 'store_type' })
  storeType: EMenuStoreType

  @Column({ type: 'varchar', length: 50, name: 'owner_id' })
  ownerId: string

  @Column({ type: 'boolean', name: 'is_closed', default: false })
  isClosed: boolean

  @OneToMany(() => MenuDish, menuDish => menuDish.menu)
  menuDishes: MenuDish[]

  @OneToMany(() => Order, order => order.menu)
  orders: Order[]
}
