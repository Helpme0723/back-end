import { PickType } from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';

export class CreateCommentDto extends PickType(Comment, ['userId', 'postId', 'content'] as const) {}
