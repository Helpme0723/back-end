import { Faker } from '@faker-js/faker';
import { Post } from 'src/post/entities/post.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Post, async (faker: Faker) => {
  const post = new Post();

  post.userId = faker.number.int({ min: 1, max: 10 });
  post.channelId = faker.number.int({ min: 1, max: 10 });
  post.seriesId = faker.number.int({ min: 1, max: 10 });
  post.categoryId = faker.number.int({ min: 1, max: 10 });
  post.title = faker.lorem.word(1);
  post.preview = faker.lorem.text();
  post.content = faker.lorem.paragraph(1);
  post.price = faker.number.int({ min: 20000, max: 70000 });
  post.viewCount = faker.number.int();
  post.likeCount = faker.number.int();

  return post;
});
