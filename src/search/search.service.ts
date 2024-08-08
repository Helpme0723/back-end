import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { VisibilityType } from 'src/post/types/visibility.type';
import { Repository } from 'typeorm';
import { SearchDto } from './dtos/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  // 포스트 데이터 인덱싱
  async postsIndexing() {
    const posts = await this.postRepository.find({
      where: { visibility: VisibilityType.PUBLIC },
      relations: {
        user: true,
      },
    });

    const mappedPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      profileUrl: post.user.profileUrl,
      title: post.title,
      preview: post.preview,
      content: post.content,
      price: post.price,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
    }));

    // TODO: fuzziness 찾아보기
    const body = mappedPosts.flatMap((post) => [
      { index: { _index: 'posts', _id: post.id } },
      post,
    ]);

    await this.elasticsearchService.bulk({
      refresh: true,
      body,
    });
  }

  // 삭제된 포스트, 비공개된 포스트 인덱싱 삭제
  async deleteIndexing() {
    const deletedPosts = await this.postRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NOT NULL')
      .orWhere('post.visibility = :value', { value: VisibilityType.PRIVATE })
      .withDeleted()
      .getMany();

    const body = deletedPosts.flatMap((post) => [
      { delete: { _index: 'posts', _id: post.id.toString() } },
    ]);

    if (body.length > 0) {
      await this.elasticsearchService.bulk({ refresh: true, body });
    }
  }

  // 엘라스틱 서치로 검색
  async searchPosts({ keyword, field, page, limit, sort }: SearchDto) {
    // 검색 조건
    const condition = [];

    if (field === 'title') {
      condition.push({
        match: { title: { query: keyword, fuzziness: 'AUTO' } },
      });
    } else if (field === 'content') {
      condition.push(
        { match: { preview: { query: keyword, fuzziness: 'AUTO' } } },
        { match: { content: { query: keyword, fuzziness: 'AUTO' } } }
      );
    } else if (field === 'all') {
      condition.push(
        { match: { title: { query: keyword, fuzziness: 'AUTO' } } },
        { match: { preview: { query: keyword, fuzziness: 'AUTO' } } },
        { match: { content: { query: keyword, fuzziness: 'AUTO' } } }
      );
    } else {
      // handle unexpected field values if necessary
    }

    // 페이지네이션 용
    const offset = (page - 1) * limit;

    const data = await this.elasticsearchService.search({
      index: 'posts',
      body: {
        query: {
          bool: {
            should: condition,
          },
        },
        sort: [{ createdAt: { order: sort } }],
      },
      from: offset,
      size: limit,
    });

    // 반환값 정렬
    const posts = data.body.hits.hits.map((hit) => ({
      id: hit._source.id,
      userId: hit._source.userId,
      nickname: hit._source.nickname,
      profileUrl: hit._source.profileUrl,
      title: hit._source.title,
      preview: hit._source.preview,
      price: hit._source.price,
      viewCount: hit._source.viewCount,
      likeCount: hit._source.likeCount,
      commentCount: hit._source.commentCount,
      createdAt: hit._source.createdAt,
    }));

    // 총 데이터 개수
    const totalCount = data.body.hits.total.value;

    return {
      posts,
      meta: {
        totalItems: totalCount, // 총 검색 결과
        itemCount: posts.length,
        itemPerPage: limit, // 페이지당 게시글 수
        totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
        currentPage: page, // 현재 페이지
      },
    };
  }

  // // db에서 바로 검색
  // async searchPostsDB(keyword: string, field: string) {
  //   const posts = await this.postRepository.find({
  //     where: { title: Like(`%${keyword}%`) },
  //   });

  //   return posts;
  // }
}
