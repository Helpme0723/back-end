import { Faker } from '@faker-js/faker';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(PurchaseList, async (faker: Faker) => {
  const purchaseList = new PurchaseList();

  purchaseList.userId = faker.number.int({ min: 1, max: 10 });
  purchaseList.postId = faker.number.int({ min: 1, max: 10 });
  purchaseList.price = faker.number.int({ min: 20000, max: 50000 });

  return purchaseList;
});
