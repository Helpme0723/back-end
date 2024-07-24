import { Faker } from '@faker-js/faker';
import { Channel } from 'src/channel/entities/channel.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Channel, async (faker: Faker) => {
  const channel = new Channel();
  channel.title = faker.company.name();
  channel.description = faker.lorem.sentence();
  channel.imageUrl = faker.image.url();
  channel.subscribers = faker.number.int();
  return channel;
});
