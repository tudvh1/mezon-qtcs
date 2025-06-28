import { Injectable, Logger } from '@nestjs/common'
import puppeteer, { Browser } from 'puppeteer'

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name)
  private activeBrowsers: Browser[] = []

  public async createBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
