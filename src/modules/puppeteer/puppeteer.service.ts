import { Injectable, Logger } from '@nestjs/common'
import puppeteer, { Browser } from 'puppeteer'

import { TypedConfigService } from '../typed-config/typed-config.service'

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name)
  private activeBrowsers: Browser[] = []

  constructor(private readonly configService: TypedConfigService) {}

  public async createBrowser(): Promise<Browser> {
    const isProduction = this.configService.get('nodeEnv') === 'production'
    const executablePath = this.configService.get('puppeteer.chromiumPath')

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...(isProduction && executablePath && { executablePath }),
    })

    this.activeBrowsers.push(browser)

    // Listen for browser disconnect
    browser.on('disconnected', () => {
      this.activeBrowsers = this.activeBrowsers.filter(b => b !== browser)
    })

    return browser
  }

  public async closeBrowser(browser: Browser): Promise<void> {
    await browser.close()
    this.activeBrowsers = this.activeBrowsers.filter(b => b !== browser)
  }

  public getActiveBrowsers(): Browser[] {
    return this.activeBrowsers
  }

  public async closeAllBrowsers(): Promise<void> {
    const closePromises = this.activeBrowsers.map(instance => this.closeBrowser(instance))
    await Promise.all(closePromises)
  }
}
