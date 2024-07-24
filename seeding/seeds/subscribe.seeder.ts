import { Subscribe } from 'src/subscribe/entities/subscribe.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class SubscribeSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const subscribeFactory = factoryManager.get(Subscribe);
    await subscribeFactory.saveMany(10);
  }
}
