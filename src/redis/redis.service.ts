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
    return this.redisClient.zIncrBy('ranking', score, value);
  }
  //sortedSet 을 조회할때 사용할 zrange
  async zrange(key: string, max: number) {
    return this.redisClient.zRange(key, 0, 2, { REV: true });
  }
  async findData(key: string) {
    //console.log('@@@@', await this.redisClient.get(key));
    return await this.redisClient.zRangeWithScores(key, 0, -1);
  }

  async check(key: string) {
    return await this.redisClient.pfCount(key);
  }
}
