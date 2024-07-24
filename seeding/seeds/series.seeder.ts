import { Series } from 'src/series/entities/series.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class SeriesSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const seriesFactory = factoryManager.get(Series);
    await seriesFactory.saveMany(10);
  }
}
