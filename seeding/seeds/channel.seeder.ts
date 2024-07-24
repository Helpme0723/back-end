import { Channel } from 'src/channel/entities/channel.entity';
import { User } from 'src/user/entities/user.entity'; // Assuming the path to user.entity.ts
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class ChannelSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const userRepository = dataSource.getRepository(User);
    const channelRepository = dataSource.getRepository(Channel);

    // 기존 사용자 데이터 가져오기
    const users = await userRepository.find();

    if (users.length === 0) {
      console.error('No users found in the database. Please seed users first.');
      return;
    }

    // 채널 생성
    const channelFactory = factoryManager.get(Channel);
    for (let i = 0; i < 10; i++) {
      const channel = await channelFactory.make();
      channel.user = users[Math.floor(Math.random() * users.length)];
      await channelRepository.save(channel);
    }
  }
}
