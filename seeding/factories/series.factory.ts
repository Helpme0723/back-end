import { Faker } from '@faker-js/faker';
import { Series } from 'src/series/entities/series.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Series, async (faker: Faker) => {
  const series = new Series();

  series.userId = faker.number.int({ min: 1, max: 10 });
  series.channelId = faker.number.int({ min: 1, max: 10 });
  series.title = faker.lorem.word();
  series.description = faker.lorem.paragraph(1);

  return series;
});
