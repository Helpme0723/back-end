import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentLike } from './comment-like.entity';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNotEmpty({ message: '포스트id를 입력해 주세요.' })
  @IsNumber()
  @Column({ unsigned: true })
  postId: number;

  /**
   * 댓글 내용
   * @example "이것은 테스트 댓글입니다."
   */
  @IsNotEmpty({ message: '컨텐츠를 입력해 주세요.' })
  @IsString()
  @MaxLength(255, { message: '댓글은 최대 255글자까지 입력 가능합니다.' })
  @Column()
  content: string;

  @IsNumber()
  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  commentLikes: CommentLike[];
}
