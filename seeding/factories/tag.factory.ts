import { Faker } from '@faker-js/faker';
import { Tag } from 'src/post/entities/tag.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Tag, async (faker: Faker) => {
  const tag = new Tag();

  tag.name = faker.lorem.word();
  return tag;
});
