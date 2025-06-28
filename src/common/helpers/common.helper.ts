import { config } from 'dotenv'

config()

export const getEnv = (key: string): string => {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}
