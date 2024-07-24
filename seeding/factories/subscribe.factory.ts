import { Faker } from '@faker-js/faker';
import { Subscribe } from 'src/subscribe/entities/subscribe.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Subscribe, async (faker: Faker) => {
  const subscribe = new Subscribe();
  subscribe.userId = faker.number.int({ min: 1, max: 10 });
  subscribe.channelId = faker.number.int({ min: 1, max: 10 });

  return subscribe;
});
