import { Channel } from 'src/channel/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class ChannelSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const users = await userRepository.find();

    const channelFactory = factoryManager.get(Channel);
    const channels = await channelFactory.saveMany(10);

    for (const channel of channels) {
      for (let i = 1; i < 11; i++) {
        channel.userId = users[i].id;
        await dataSource.getRepository(Channel).save(channel);
      }
    }
  }
}
