import { Controller, Post, Body, HttpStatus, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('6.댓글')
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
  async create(@UserInfo()user:User, @Body() createCommentDto: CreateCommentDto) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    const commentData = { ...createCommentDto, userId }; // 새로운 객체를 생성하여 userId를 포함
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
   * 댓글 수정
   * @param updateCommentDto
   * @returns 수정 댓글 정보와 상태 메시지
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':commentId')
  async update(@UserInfo()user:User, @Param('commentId') commentId: number, @Body() updateCommentDto: UpdateCommentDto) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
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
   * @returns
   * */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  async delete(@UserInfo()user:User, @Param('commentId') commentId: number) {
    const userId = user.id; // 인증된 사용자의 ID를 가져옴
    await this.commentService.deleteComment(userId, commentId);
    return {
      status: HttpStatus.OK,
      message: '댓글을 삭제하였습니다.',
    };
  }
}
