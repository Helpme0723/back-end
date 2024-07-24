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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  nickname: string;

  @Column()
  profileUrl: string;

  @Column()
  description: string;

  @Column()
  point: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany(() => Channel, (channel) => channel.user, { cascade: ['soft-remove'] })
  channels: Channel[];

  @OneToMany(() => Series, (series) => series.user, { cascade: ['soft-remove'] })
  series: Series[];

  @OneToMany(() => Post, (post) => post.user, { cascade: ['soft-remove'] })
  posts: Post[];

  @OneToMany(() => Comment, (commnet) => commnet.user, { cascade: ['soft-remove'] })
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => Subscribe, (subscribe) => subscribe.user)
  subscribes: Subscribe[];

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.user, { cascade: ['soft-remove'] })
  pointHistories: PointHistory[];

  @OneToMany(() => PurchaseList, (purchaseList) => purchaseList.user, { cascade: ['soft-remove'] })
  purchaseLists: PurchaseList[];
}
