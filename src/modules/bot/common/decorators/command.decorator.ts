import { CommandStorage } from '@/modules/bot/common/storages'
import { BaseCommand } from '../../interactions/command/command.base'

export function Command(commandName: string) {
  return function <T extends new (...args: any[]) => BaseCommand>(target: T): void {
    CommandStorage.registerCommand(commandName, target)
  }
}
