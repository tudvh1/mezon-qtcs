import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import puppeteer, { Browser } from 'puppeteer'
import * as fs from 'fs'

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name)
  private activeBrowsers: Browser[] = []

  constructor(private readonly configService: ConfigService) {}

  private getExecutablePath(): string | undefined {
    const configPath = this.configService.get('PUPPETEER_EXECUTABLE_PATH')
    if (configPath) {
      return configPath
    }
    return undefined
  }

  public async createBrowser(): Promise<Browser> {
    const executablePath = this.getExecutablePath()

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
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
