import { BaseButtonClick } from '../../interactions/button-click/button-click.base'

export class ButtonClickStorage {
  private static buttonClicks: Map<string, new (...args: any[]) => BaseButtonClick> = new Map()

  public static registerButtonClick(
    buttonName: string,
    buttonClass: new (...args: any[]) => BaseButtonClick,
  ): void {
    this.buttonClicks.set(buttonName, buttonClass)
  }

  public static getButtonClick(
    buttonName: string,
  ): (new (...args: any[]) => BaseButtonClick) | undefined {
    return this.buttonClicks.get(buttonName)
  }
}
