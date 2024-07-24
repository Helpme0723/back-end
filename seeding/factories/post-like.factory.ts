import { Faker } from '@faker-js/faker';
import { PostLike } from 'src/post/entities/post-like.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(PostLike, async (faker: Faker) => {
  const postLike = new PostLike();

  postLike.userId = faker.helpers.uniqueArray[faker.number.int({ min: 1, max: 10 })];
  postLike.postId = faker.helpers.uniqueArray[faker.number.int({ min: 1, max: 10 })];

  return postLike;
});
