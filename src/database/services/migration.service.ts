import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldRunMigration = this.configService.get('AUTO_MIGRATION') === 'true'
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

      if (this.configService.get('NODE_ENV') === 'production') {
        process.exit(1)
      }

      throw error
    }
  }
}
