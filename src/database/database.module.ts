import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MigrationService } from './services/migration.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: ['dist/database/entities/*.entity.js'],
        subscribers: ['dist/database/subscribers/*.subscriber.js'],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        autoLoadEntities: true,
        logging: ['error', 'migration'],
        timezone: 'Z',
      }),
    }),
    ConfigModule,
  ],
  providers: [MigrationService],
})
export class DatabaseModule {}
