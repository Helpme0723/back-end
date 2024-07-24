import { Faker } from '@faker-js/faker';
import { PointHistory } from 'src/point/entities/point-history.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(PointHistory, async (faker: Faker) => {
  const pointHistory = new PointHistory();
  pointHistory.userId = faker.number.int({ min: 1, max: 10 });
  pointHistory.amount = faker.number.int({ min: 20000, max: 100000 });
  pointHistory.description = faker.lorem.paragraph(2);

  return pointHistory;
});
