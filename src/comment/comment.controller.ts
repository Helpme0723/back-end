import { Controller, Post, Body, HttpStatus, Patch, Param, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('6.댓글')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

/**
 * 댓글 생성
 * @param createCommentDto
 * @returns 생성된 댓글 정보와 상태 메시지
 * */
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const data = await this.commentService.createComment(createCommentDto);
    return {
      status: HttpStatus.OK,
      message: '댓글을 생성하였습니다.',
      data,
    };
  }

  /**
   * 댓글 수정
   * @param updateCommentDto
   * @returns 수정 댓글 정보와 상태 메시지
   * */
  @Patch(':commentId')
  async update(@Param('commentId') commentId: number, @Body() updateCommentDto: UpdateCommentDto) {
    const userId = 45; // 실제 구현에서는 로그인한 사용자의 ID를 가져와야 함
    const data = await this.commentService.updateComment(userId, commentId, updateCommentDto);
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
  @Delete(':commentId')
  async delete(@Param('commentId') commentId: number) {
    const userId = 1; // 실제 구현에서는 로그인한 사용자의 ID를 가져와야 함.
    await this.commentService.deleteComment(userId, commentId);
    return {
      status: HttpStatus.OK,
      message: '댓글을 삭제하였습니다.',
    };
  }
}
