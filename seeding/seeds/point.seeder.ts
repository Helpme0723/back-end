import { PointHistory } from 'src/point/entities/point-history.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class PointHistorySeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const pointHistoryFactory = factoryManager.get(PointHistory);
    await pointHistoryFactory.saveMany(10);
  }
}
