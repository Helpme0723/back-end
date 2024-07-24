import { User } from 'src/user/entities/user.entity';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { faker } from '@faker-js/faker';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userFactory = factoryManager.get(User);
    const users = await userFactory.saveMany(10);
    const refreshTokenFactory = factoryManager.get(RefreshToken);

    for (const user of users) {
      refreshTokenFactory.save({
        userId: user.id,
        token: faker.string.uuid(),
      });
    }
  }
}
