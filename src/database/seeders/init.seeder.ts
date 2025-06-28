import { DataSource } from 'typeorm'
import { runSeeders, Seeder } from 'typeorm-extension'

export default class InitSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    console.log('Start seed data...')

    const seeds = []
    const factories = []

    if (seeds.length === 0) {
      console.log('No seed data defined. Skipping seed process.')
      return Promise.resolve()
    }

    console.log(`Running ${seeds.length} seed(s)...`)
    await runSeeders(dataSource, {
      seeds,
      factories,
    })

    console.log('Seed data completed successfully!')
  }
}
