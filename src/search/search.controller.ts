import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Cron } from '@nestjs/schedule';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // @Cron('* * * * *')
  // async postsIndexing() {
  //   console.log('*****포스트 인덱싱*****');
  //   await this.searchService.postsIndexing();
  // }

  // @Cron('* * * * *')
  // async deleteIndexing() {
  //   console.log('*****삭제된 포스트 인덱싱 삭제*****');
  //   await this.searchService.deleteIndexing();
  // }

  @Get()
  async searchPosts(
    @Query('keyword') keyword: string,
    @Query('field') field?: string
  ) {
    const data = this.searchService.searchPosts(keyword, field);

    return data;
  }
}
