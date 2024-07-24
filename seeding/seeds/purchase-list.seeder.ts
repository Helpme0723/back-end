import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class PurchaseListSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const purchaseFactory = factoryManager.get(PurchaseList);
    await purchaseFactory.saveMany(10);
  }
}
