import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async postsIndexing() {
    const data = this.searchService.postsIndexing();

    return data;
  }

  @Get('keyword')
  async searchPosts(
    @Query('keyword') keyword: string,
    @Query('field') field?: string
  ) {
    const data = this.searchService.searchPosts(keyword, field);

    return data;
  }
}
