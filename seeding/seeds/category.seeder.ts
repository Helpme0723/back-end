import { Category } from 'src/post/entities/category.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const categoryFactory = factoryManager.get(Category);
    await categoryFactory.saveMany(10);
  }
}
