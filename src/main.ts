import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { utilities, WinstonModule } from 'nest-winston'
import * as winston from 'winston'

import { AppModule } from './app.module'

async function bootstrap() {
  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          utilities.format.nestLike(),
        ),
      }),
    ],
  })

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  })

  const configService = app.get(ConfigService)

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Mezon QTCS Bot API')
    .setDescription('API documentation for the Mezon Qua Tang Cot Song Bot')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions)
  SwaggerModule.setup('api', app, swaggerDocument)

  app.enableCors({
    origin: '*',
  })

  const port: number = configService.get('APP_PORT') ?? 3000
  const apiUrl: string = configService.get('APP_API_URL') ?? ''
  await app.listen(port, () => {
    console.log(`Server is running on ${apiUrl}`)
  })
}

void bootstrap()
