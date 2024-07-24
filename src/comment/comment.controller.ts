import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags } from '@nestjs/swagger';

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
}
