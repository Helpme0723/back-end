import { Faker } from '@faker-js/faker';
import { Category } from 'src/post/entities/category.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Category, async (faker: Faker) => {
  const category = new Category();

  category.category = faker.lorem.word(1);
  return category;
});
