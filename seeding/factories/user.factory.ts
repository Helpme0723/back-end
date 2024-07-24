import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

export default setSeederFactory(User, async (faker: Faker) => {
  const user = new User();
  user.email = faker.internet.email();
  user.password = bcrypt.hashSync('password', 10);
  user.nickname = faker.internet.userName();
  user.profileUrl = faker.image.url();
  user.description = faker.lorem.words(3);
  user.point = faker.number.int({ min: 30000, max: 100000 });
  return user;
});
