import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private redisClient: RedisClientType;
  constructor(private readonly configService: ConfigService) {
    this.redisClient = createClient({
      socket: {
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      },
      username: configService.get<string>('REDIS_USERNAME'),
      password: configService.get<string>('REDIS_PASSWORD'),
    });
    this.redisClient.connect().catch(console.error);
  }
  // sortedSet 애 추가할때 호출할 zadd
  async searchData(key: string, score: number, value: string) {
    const ttl = 60 * 60;
    await this.redisClient.zIncrBy(key, score, value);
    await this.redisClient.expire(key, ttl);
    return true;
  }
  //sortedSet 을 조회할때 사용할 zrange
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async zrange(key: string, max: number) {
    return this.redisClient.zRange(key, 0, 2, { REV: true });
  }
  async findData(key: string) {
    return await this.redisClient.zRangeWithScores(key, 0, -1);
  }

  async gatherData() {
    const keys = await this.redisClient.keys('ranking:*');
    keys.sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    const recentKeys = keys.slice(0, 3);
    // zUnionStore를 사용하여 병합하고 결과를 'dest_key'에 저장하기.
    await this.redisClient.zUnionStore('dest_key', recentKeys);

    // 'dest_key'에 저장된 병합된 결과를 점수와 함께 가져오기.
    const result = await this.redisClient.zRangeWithScores('dest_key', 0, -1);

    return result;
  }
}
