import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MenuDish, Order } from '@/database/entities'
import { OrderService } from './order.service'

@Module({
  imports: [TypeOrmModule.forFeature([Order, MenuDish])],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
