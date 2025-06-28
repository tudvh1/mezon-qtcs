import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Menu, MenuDish } from '@/database/entities'
import { MenuService } from './menu.service'

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuDish])],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
