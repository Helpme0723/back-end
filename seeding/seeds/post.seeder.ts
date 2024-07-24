import { Post } from 'src/post/entities/post.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class PostSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const postFactory = factoryManager.get(Post);
    await postFactory.saveMany(10);
  }
}
