import { Controller, Get, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Cron } from '@nestjs/schedule';
import { SearchDto } from './dtos/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // @Cron('*/5 * * * *')
  // async postsIndexing() {
  //   console.log('*****포스트 인덱싱*****');
  //   await this.searchService.postsIndexing();
  // }

  // @Cron('*/5 * * * *')
  // async deleteIndexing() {
  //   console.log('*****삭제된 포스트, 비공개된 포스트 인덱싱 삭제*****');
  //   await this.searchService.deleteIndexing();
  // }

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
  async getsearchRanking() {
    const data = await this.searchService.getsearchRankings();
    return data;
  }

  /**
   * 검색랭킹데이DB업데이트
   * @returns
   */
  @Cron('*/10 * * * *')
  @Post('ranking')
  async addsearchRanking() {
    console.log('*****검색랭킹 데이터 업데이트*****');
    const data = await this.searchService.saveDataAtDateBase();
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
