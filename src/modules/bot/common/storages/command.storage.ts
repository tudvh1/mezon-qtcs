import { BaseCommand } from '../../interactions/command/command.base'

export class CommandStorage {
  private static commands: Map<string, new (...args: any[]) => BaseCommand> = new Map()

  public static registerCommand(
    commandName: string,
    commandClass: new (...args: any[]) => BaseCommand,
  ): void {
    this.commands.set(commandName, commandClass)
  }

  public static getCommand(commandName: string): (new (...args: any[]) => BaseCommand) | undefined {
    return this.commands.get(commandName)
  }
}
