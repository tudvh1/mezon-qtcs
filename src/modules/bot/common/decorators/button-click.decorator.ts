import { BaseButtonClick } from '../../interactions/button-click/button-click.base'
import { ButtonClickStorage } from '../storages'

export function ButtonClick(buttonName: string) {
  return function <T extends new (...args: any[]) => BaseButtonClick>(target: T): void {
    ButtonClickStorage.registerButtonClick(buttonName, target)
  }
}
