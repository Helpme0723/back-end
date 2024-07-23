import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_likes')
@Unique(['userId', 'commentId'])
export class CommentLike {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  commentId: number;

  @ManyToOne(() => User, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.commentLikes, { onDelete: 'CASCADE' })
  comment: Comment;
}
