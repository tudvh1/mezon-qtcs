import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { TypedConfigService } from '@/modules/typed-config/typed-config.service'

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: TypedConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldRunMigration = this.configService.get('database.autoMigration')
    if (shouldRunMigration) {
      await this.runMigrations()
    }
  }

  private async runMigrations() {
    try {
      this.logger.log('Checking for pending migrations...')

      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize()
      }

      const hasPendingMigrations = await this.dataSource.showMigrations()

      if (hasPendingMigrations) {
        this.logger.log('Found pending migrations, running them...')
        await this.dataSource.runMigrations()
        this.logger.log('Database migrations completed successfully!')
      } else {
        this.logger.log('Database is up to date - no pending migrations')
      }
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`, error)

      if (this.configService.get('nodeEnv') === 'production') {
        process.exit(1)
      }

      throw error
    }
  }
}
