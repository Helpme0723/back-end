import { Controller, Post, Body, HttpStatus, Patch, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateCommentDto } from './dto/update-comment.dto';

/**
 * 댓글 생성
 * @param createCommentDto
 * @returns 생성된 댓글 정보와 상태 메시지
 * */
@ApiTags('댓글')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto): Promise<any> {
    const data = await this.commentService.create(createCommentDto);
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
  async update(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<any> {
    const data = await this.commentService.update(commentId, updateCommentDto);
    return {
      status: HttpStatus.OK,
      message: "댓글을 수정하였습니다.",
      data,
    };
  }
}
