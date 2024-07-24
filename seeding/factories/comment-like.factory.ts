import { Faker } from '@faker-js/faker';
import { CommentLike } from 'src/comment/entities/comment-like.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(CommentLike, async (faker: Faker) => {
  const commentLike = new CommentLike();

  return commentLike;
});
