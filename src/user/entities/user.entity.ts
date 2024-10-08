import { Channel } from 'src/channel/entities/channel.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
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
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { PointOrder } from 'src/point/entities/point-order.entity';
import { Type } from 'class-transformer';
import { NotificationSettings } from 'src/notification/entities/notification-settings.entity';
import { Notification } from 'src/notification/entities/notification.entity'; // 알림 엔티티 추가

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
   * @example "Qwer1234!"
   */
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsStrongPassword(
    {},
    {
      message:
        '비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자(!@#$%^&*)를 포함해서 8자리 이상으로 입력해야 합니다.',
    }
  )
  @Column({ select: false, nullable: true })
  password: string;

  /**
   * 닉네임
   * @example "닉네임"
   */
  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @Column()
  nickname: string;

  @Column({
    default:
      'https://d2uok5v3sm5rr4.cloudfront.net/images/02a029aa-caa2-48c8-8196-bd60f4366383.webp',
  })
  profileUrl: string;

  @Column({ default: '안녕하세요.' })
  description: string;

  @Column({ default: 500000 })
  point: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  naver: boolean;

  @Column({ default: false })
  kakao: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;

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

  @OneToMany(() => NotificationSettings, (settings) => settings.user, {
    cascade: true,
  })
  notificationSettings: NotificationSettings[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  }) // 알림 관계 추가
  notifications: Notification[];
}
