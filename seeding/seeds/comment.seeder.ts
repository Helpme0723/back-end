import { CommentLike } from 'src/comment/entities/comment-like.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class CommentSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const userRepository = dataSource.getRepository(User);
    const postRepository = dataSource.getRepository(Post);
    const commentLikeRepository = dataSource.getRepository(CommentLike);
    const commentFactory = factoryManager.get(Comment);

    const users = await userRepository.find();
    const posts = await postRepository.find();

    for (const user of users) {
      for (const post of posts) {
        const comments = await commentFactory.saveMany(10);
        for (const comment of comments) {
          comment.user = user;
          comment.post = post;
          await dataSource.getRepository(Comment).save(comment);
          const commentLike = new CommentLike();
          commentLike.user = user;
          commentLike.comment = comment;
          await commentLikeRepository.save(commentLike);
        }
      }
    }
  }
}
