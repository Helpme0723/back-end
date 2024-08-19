import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { Search } from './entities/search.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Search]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [SearchController],
  providers: [SearchService, RedisService],
  exports: [ElasticsearchModule, SearchService],
})
export class SearchModule {}
