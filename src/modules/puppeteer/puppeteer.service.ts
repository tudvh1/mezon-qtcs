import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import puppeteer, { Browser } from 'puppeteer'

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name)
  private activeBrowsers: Browser[] = []

  constructor(private readonly configService: ConfigService) {}

  public async createBrowser(): Promise<Browser> {
    const isProduction = this.configService.get('NODE_ENV') === 'production'

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...(isProduction && { executablePath: this.configService.get('PUPPETEER_CHROMIUM_PATH') }),
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
