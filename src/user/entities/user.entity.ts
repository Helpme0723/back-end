import { Channel } from 'src/channel/entities/channel.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Series } from 'src/series/entities/series.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/post/entities/post-like.entity';
import { CommentLike } from 'src/comment/entities/comment-like.entity';
import { Subscribe } from 'src/subscribe/entities/subscribe.entity';
import { PointHistory } from 'src/point/entities/point-history.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { UserRole } from '../types/user-role.type';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PointOrder } from 'src/point/entities/point-order.entity';
import { Type } from 'class-transformer';

@Entity('users')
export class User {
  @Type(() => Number)
  @IsNumber()
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /**
   * 이메일
   * @example "email@domain.com"
   */
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @Column({ unique: true })
  email: string;

  /**
   * 비밀번호
   * @example "qwer1234"
   */
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @Column({ select: false })
  password: string;

  /**
   * 닉네임
   * @example "닉네임"
   */
  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @Column()
  nickname: string;

  @Column({ default: '기본 이미지.jpg' })
  profileUrl: string;

  @Column({ default: '안녕하세요.' })
  description: string;

  @Column()
  point: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany(() => Channel, (channel) => channel.user, { cascade: true })
  channels: Channel[];

  @OneToMany(() => Series, (series) => series.user, { cascade: true })
  series: Series[];

  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => Subscribe, (subscribe) => subscribe.user)
  subscribes: Subscribe[];

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.user, {
    cascade: true,
  })
  pointHistories: PointHistory[];

  @OneToMany(() => PointOrder, (pointOrder) => pointOrder.user, {
    cascade: true,
  })
  pointOrder: PointOrder[];

  @OneToMany(() => PurchaseList, (purchaseList) => purchaseList.user, {
    cascade: true,
  })
  purchaseLists: PurchaseList[];
}
