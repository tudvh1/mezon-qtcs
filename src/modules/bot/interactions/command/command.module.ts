import { Module } from '@nestjs/common'

import { MenuModule } from '@/modules/menu/menu.module'
import { MezonClientModule } from '@/modules/mezon-client/mezon-client.module'
import { PuppeteerModule } from '@/modules/puppeteer/puppeteer.module'
import { CommandDispatcher } from './command.dispatcher'
import { MenuCommand, TruanayangiCommand } from './handlers'

@Module({
  imports: [MezonClientModule, PuppeteerModule, MenuModule],
  providers: [CommandDispatcher, TruanayangiCommand, MenuCommand],
  exports: [CommandDispatcher, TruanayangiCommand, MenuCommand],
})
export class CommandModule {}
