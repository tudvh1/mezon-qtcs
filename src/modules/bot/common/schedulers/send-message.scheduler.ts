import { Injectable, Logger } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'

import { MezonClientService } from '@/modules/mezon-client/mezon-client.service'

@Injectable()
export class SendMessageScheduler {
  private readonly logger = new Logger(SendMessageScheduler.name)
  private readonly orderLunchClanId = '0'
  private readonly orderLunchChannelId = '1840668051838603264'

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mezonClientService: MezonClientService,
  ) {
    this.initCronJobs()
  }

  initCronJobs(): void {
    this.addCronJob('remindOrderLunch', '30 10 * * 1-5', () => this.remindOrderLunch())
  }

  addCronJob(name: string, pattern: string, callback: () => Promise<void> | void): void {
    if (this.schedulerRegistry.getCronJobs().has(name)) {
      this.logger.warn(`Cron job '${name}' already exists. Skipping.`)
      return
    }

    const job = new CronJob(
      pattern,
      async () => {
        this.logger.log(`Executing cron job '${name}' at pattern '${pattern}'`)
        try {
          await callback()
          this.logger.log(`Cron job '${name}' completed successfully`)
        } catch (error) {
          this.logger.error(`Error executing cron job '${name}': ${error.message}`, error)
        }
      },
      null,
      true,
      'Asia/Ho_Chi_Minh',
    )

    this.schedulerRegistry.addCronJob(name, job)
    job.start()

    this.logger.log(`Registered cron job '${name}' with pattern '${pattern}'`)
  }

  async remindOrderLunch(): Promise<void> {
    const channel = await this.mezonClientService.fetchChannel(
      this.orderLunchClanId,
      this.orderLunchChannelId,
    )

    await channel.send({
      t: '*truanayangi',
    })
  }
}
