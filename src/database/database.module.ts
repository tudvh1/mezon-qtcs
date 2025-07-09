import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TypedConfigService } from '@/modules/typed-config/typed-config.service'
import { MigrationService } from './services/migration.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (configService: TypedConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        database: configService.get('database.name'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        entities: ['dist/database/entities/*.entity.js'],
        subscribers: ['dist/database/subscribers/*.subscriber.js'],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        autoLoadEntities: true,
        logging: ['error', 'migration'],
        timezone: 'Z',
      }),
    }),
  ],
  providers: [MigrationService],
})
export class DatabaseModule {}
