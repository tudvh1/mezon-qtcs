import { Module } from '@nestjs/common'

import { MenuModule } from '@/modules/menu/menu.module'
import { MezonClientModule } from '@/modules/mezon-client/mezon-client.module'
import { OrderModule } from '@/modules/order/order.module'
import { ButtonClickDispatcher } from './button-click.dispatcher'
import { MenuButtonClick, MenuCloseConfirmButtonClick, OrderButtonClick } from './handlers'

@Module({
  imports: [MezonClientModule, MenuModule, OrderModule],
  providers: [
    ButtonClickDispatcher,
    MenuButtonClick,
    OrderButtonClick,
    MenuCloseConfirmButtonClick,
  ],
  exports: [ButtonClickDispatcher],
})
export class ButtonClickModule {}
