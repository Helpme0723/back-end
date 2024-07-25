import { PickType } from '@nestjs/swagger';
import { CommentLike } from '../entities/comment-like.entity';

export class CreateCommentLikeDto extends PickType(CommentLike, ['commentId'] as const) {}