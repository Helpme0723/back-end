import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import UserSeeder from './seeds/user.seeder';
import userFactory from './factories/user.factory';
import { User } from 'src/user/entities/user.entity';

dotenv.config();

(async () => {
  const options: DataSourceOptions & SeederOptions = {
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: JSON.parse(process.env.DB_SYNC),
    entities: [User],
    seeds: [UserSeeder],
    factories: [userFactory],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
  console.log('seeding 완료');
  process.exit();
})();
