import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dtos/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 엘라스틱 서치 포스트 검색
   * @param searchDto
   * @returns
   */
  @Get()
  async searchPosts(@Query() searchDto: SearchDto) {
    const data = this.searchService.searchPosts(searchDto);

    return data;
  }

  /**
   * 검색랭킹불러오기
   * @returns
   */
  @Get('ranking')
  async getSearchRanking() {
    const data = await this.searchService.getSearchRankings();
    return data;
  }

  // // db에서 바로 검색 테스트용
  // @Get('db')
  // async searchPostsDB(
  //   @Query('keyword') keyword: string,
  //   @Query('field') field?: string
  // ) {
  //   const data = this.searchService.searchPostsDB(keyword, field);

  //   return data;
  // }
}
