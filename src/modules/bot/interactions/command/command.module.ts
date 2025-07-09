import { Module } from '@nestjs/common'

import { MenuModule } from '@/modules/menu/menu.module'
import { MezonClientModule } from '@/modules/mezon-client/mezon-client.module'
import { PuppeteerModule } from '@/modules/puppeteer/puppeteer.module'
import { CommandDispatcher } from './command.dispatcher'
import {
  AnhtraisayhaiCommand,
  AnlauCommand,
  CheosupCommand,
  ChuataidauCommand,
  MenuCommand,
  Nhac2k8Command,
  QtcsCommand,
  TruanayangiCommand,
} from './handlers'

@Module({
  imports: [MezonClientModule, PuppeteerModule, MenuModule],
  providers: [
    CommandDispatcher,
    QtcsCommand,
    TruanayangiCommand,
    MenuCommand,
    AnlauCommand,
    AnhtraisayhaiCommand,
    ChuataidauCommand,
    CheosupCommand,
    Nhac2k8Command,
  ],
  exports: [CommandDispatcher, TruanayangiCommand],
})
export class CommandModule {}
