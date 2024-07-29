import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { userInfo } from 'os';

@ApiTags('8.라이브러리')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * 내가 좋아요한 포스트 조회
   * @param user 유저정보
   * @returns 조회된 정보
   * 해당되는 정보가 없을경우 빈 배열 리턴
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '좋아요 한 포스트 조회', description: '내가 좋아요한 포스트를 조회합니다.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '좋아요한 포스트 조회 성공.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('posts/likes')
  async findLikedPosts(@UserInfo() user: User) {
    const data = await this.libraryService.findLikedPostsByUesrId(user.id);

    return {
      status: HttpStatus.OK,
      message: '좋아요한 포스트 조회 성공.',
      data: data,
    };
  }

  /**
   * 작성한 댓글 조회
   * @param user 유저정보
   * @returns 조회된 정보
   * 해당되는 정보가 없을경우 빈 배열 리턴
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '작성한 댓글 조회', description: '내가 작성한 댓글을 조회합니다.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '작성한 댓글 조회 성공.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('comments')
  async findComments(@UserInfo() user: User) {
    const data = await this.libraryService.findCommentsByUserId(user.id);

    return {
      status: HttpStatus.OK,
      message: '작성한 댓글 조회 성공.',
      data: data,
    };
  }

  /**
   * 구매한 포스트 조회
   * @param user 유저정보
   * @returns 조회한 정보
   * 해당되는 정보가 없을경우 빈 배열 리턴
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '구매한 포스트 조회', description: '내가 구매한 포스트를 조회합니다.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '구매한 포스트 조회 성공.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('posts/purchases')
  async findPurchasedPost(@UserInfo() user: User) {
    const data = await this.libraryService.findPurchasedPostByUserId(user.id);

    return {
      status: HttpStatus.OK,
      message: '구매한 포스트 조회 성공',
      data: data,
    };
  }
}
