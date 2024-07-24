import { PostLike } from 'src/post/entities/post-like.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class PostLikeSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const postLikeFactory = factoryManager.get(PostLike);
    await postLikeFactory.saveMany(10);
  }
}
