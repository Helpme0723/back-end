import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  // 포스트 데이터 인덱싱
  async postsIndexing() {
    const posts = await this.postRepository.find();

    const body = posts.flatMap((post) => [
      { index: { _index: 'posts', _id: post.id } },
      post,
    ]);

    await this.elasticsearchService.bulk({
      refresh: true,
      body,
    });
  }

  // 삭제된 포스트 인덱싱 삭제
  async deleteIndexing() {
    console.log('@@@@@@@@@@@@@@@@@@@@');

    const deletedPosts = await this.postRepository.find({
      where: { deletedAt: Not(IsNull()) },
    });

    const body = deletedPosts.flatMap((post) => [
      { delete: { _index: 'posts', _id: post.id.toString() } },
    ]);

    console.log('###', body);

    if (body.length > 0) {
      await this.elasticsearchService.bulk({ refresh: true, body });
    }
  }

  // 엘라스틱 서치로 검색
  async searchPosts(keyword: string, field?: string) {
    const deletedPosts = await this.postRepository.find({
      // where: { deletedAt: MoreThan(new Date(0)) },
    });
    console.log('##############', deletedPosts);
    const shouldCondition = [];

    if (field === 'title') {
      shouldCondition.push({ match: { title: keyword } });
    } else if (field === 'content') {
      shouldCondition.push(
        { match: { preview: keyword } },
        { match: { content: keyword } }
      );
    } else {
      shouldCondition.push(
        { match: { title: keyword } },
        { match: { preview: keyword } },
        { match: { content: keyword } }
      );
    }

    console.log(shouldCondition);

    const data = await this.elasticsearchService.search({
      index: 'posts',
      body: {
        query: {
          bool: {
            should: shouldCondition,
          },
        },
      },
    });

    return data.body.hits.hits;
  }
}
