import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { getTime } from 'date-fns';

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
    return this.redisClient.zIncrBy(key, score, value);
  }
  //sortedSet 을 조회할때 사용할 zrange
  async zrange(key: string, max: number) {
    return this.redisClient.zRange(key, 0, 2, { REV: true });
  }
  async findData(key: string) {
    console.log('@@@@', key);
    return await this.redisClient.zRangeWithScores(key, 0, -1);
  }

  async gatherData() {
    const keys = await this.redisClient.keys('ranking:*');
    console.log('키목록', keys);

    //new Date(getTime)

    keys.sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    console.log('keys', keys);
    const recentKeys = keys.slice(0, 3);
    console.log('최근3개키', recentKeys);
    // zUnionStore를 사용하여 병합하고 결과를 'dest_key'에 저장하기.
    await this.redisClient.zUnionStore('dest_key', recentKeys);

    // 'dest_key'에 저장된 병합된 결과를 점수와 함께 가져오기.
    const result = await this.redisClient.zRangeWithScores('dest_key', 0, -1);
    console.log(result);

    const willDeletedKey = keys.slice(6);
    console.log('삭제될 키 목록', willDeletedKey);
    // await this.redisClient.del(willDeletedKey);
    return result;
  }
}
