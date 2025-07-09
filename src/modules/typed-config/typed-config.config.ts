import { EnvironmentVariables } from './typed-config.interface'

export const envConfig = (): EnvironmentVariables => ({
  nodeEnv: process.env.NODE_ENV ?? 'local',
  app: {
    port: parseInt(process.env.APP_PORT ?? '8000', 10),
    apiUrl: process.env.APP_API_URL ?? 'http://localhost:8000',
  },
  database: {
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    name: process.env.DATABASE_NAME ?? '',
    user: process.env.DATABASE_USERNAME ?? '',
    password: process.env.DATABASE_PASSWORD ?? '',
    autoMigration: process.env.DATABASE_AUTO_MIGRATION === 'true',
  },
  mezon: {
    token: process.env.MEZON_TOKEN ?? '',
  },
  puppeteer: {
    chromiumPath: process.env.PUPPETEER_CHROMIUM_PATH ?? '',
  },
})
