import { Tag } from 'src/post/entities/tag.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class TagSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const tagFactory = factoryManager.get(Tag);
    await tagFactory.saveMany(10);
  }
}
