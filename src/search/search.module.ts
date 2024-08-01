import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
