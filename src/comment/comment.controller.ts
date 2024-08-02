import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Get,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { FindAllCommentsDto } from './dto/pagination.dto';

@ApiTags('05.댓글')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 댓글 생성
   * @param createCommentDto
   * @returns 생성된 댓글 정보와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @UserInfo() user: User,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴

    // userId를 createCommentDto에 추가
    const commentData = { ...createCommentDto, userId };
    const data = await this.commentService.createComment(commentData);

    // `deletedAt` 속성을 제거
    delete data.deletedAt;
    return {
      status: HttpStatus.OK,
      message: '댓글을 생성하였습니다.',
      data,
    };
  }

  /**
   * 댓글 전체 조회
   * @param postId 조회할 포스트 ID
   * @param page 조회할 page
   * @param limit 조회할 페이지당 갯수 제한
   * @returns 생성된 댓글 정보와 상태 메시지
   * */
  @Get()
  async findAllComments(@Query() findAllCommentsDto: FindAllCommentsDto) {
    const data = await this.commentService.findAllComments(findAllCommentsDto);
    return {
      status: HttpStatus.OK,
      message: '댓글을 조회하였습니다.',
      data,
    };
  }

  /**
   * 댓글 수정
   * @param updateCommentDto
   * @returns 수정 댓글 정보와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':commentId')
  async update(
    @UserInfo() user: User,
    @Param('commentId', ParseIntPipe) commentId: number, // commentId에 ParseIntPipe 추가
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const data = await this.commentService.updateComment(
      userId,
      commentId,
      updateCommentDto
    );
    return {
      status: HttpStatus.OK,
      message: '댓글을 수정하였습니다.',
      data,
    };
  }

  /**
   * 댓글 삭제
   * @param commentId 댓글 ID
   * @returns 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  async delete(
    @UserInfo() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    await this.commentService.deleteComment(userId, commentId);
    return {
      status: HttpStatus.OK,
      message: '댓글을 삭제하였습니다.',
    };
  }

  /**
   * 댓글 좋아요 등록
   * @param commentId 댓글 ID
   * @returns 생성된 댓글 좋아요 정보와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':commentId/likes')
  async createLike(
    @UserInfo() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const data = await this.commentService.createCommentLike(userId, commentId);
    return {
      status: HttpStatus.OK,
      message: '댓글에 좋아요를 눌렀습니다.',
      data,
    };
  }

  /**
   * 댓글 좋아요 취소
   * @param commentId 댓글 ID
   * @returns 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId/likes')
  async deleteLike(
    @UserInfo() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    await this.commentService.deleteCommentLike(userId, commentId);
    return {
      status: HttpStatus.OK,
      message: '좋아요를 취소하였습니다.',
    };
  }
}
