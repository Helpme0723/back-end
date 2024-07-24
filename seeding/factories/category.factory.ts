import { Faker } from '@faker-js/faker';
import { Category } from 'src/post/entities/category.entity';
import { setSeederFactory } from 'typeorm-extension';

const existingCategories = new Set<string>();

export default setSeederFactory(Category, async (faker: Faker) => {
  const category = new Category();
  let newCategory: string;

  do {
    newCategory = faker.lorem.word(10);
  } while (existingCategories.has(newCategory));

  existingCategories.add(newCategory);
  category.category = newCategory;

  return category;
});
