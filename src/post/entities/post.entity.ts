import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostLike } from './post-like.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { Series } from 'src/series/entities/series.entity';
import { VisibilityType } from '../types/visibility.type';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DailyInsight } from 'src/insight/entities/daily-insight.entity';
import { MonthlyInsight } from 'src/insight/entities/monthly-insight.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNotEmpty({ message: '채널아이디를 입력해주세요' })
  @IsNumber()
  @Column({ unsigned: true })
  channelId: number;

  @IsOptional()
  @IsNumber()
  @Column({ nullable: true, unsigned: true })
  seriesId?: number;

  @IsNotEmpty({ message: '카테고리 아이디를 입력해주세요' })
  @IsNumber()
  @Column({ unsigned: true })
  categoryId: number;

  /**
   * 포스트이름
   * @example "포스트1번입니다"
   */
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  @IsString()
  @Column()
  title: string;

  /**
   * 프리뷰이름
   * @example "프리뷰1번입니다"
   */
  @IsOptional()
  @IsString()
  @Column({ type: 'text' })
  preview: string;

  /**
   * 내용
   * @example "내용1번입니다"
   */
  @IsNotEmpty({ message: '컨텐츠를 입력해주세요' })
  @IsString()
  @Column({ type: 'text' })
  content: string;

  /**
   * 가격
   * @example 30000
   */
  @IsNotEmpty({ message: '가격을 입력해주세요' })
  @IsNumber()
  @Column({ default: 0 })
  price: number;

  /**
   * 공개여부 설정
   * @example "PUBLIC"
   */
  @IsOptional()
  @IsEnum(Object.values(VisibilityType))
  @Column({
    type: 'enum',
    enum: VisibilityType,
    default: VisibilityType.PUBLIC,
  })
  visibility?: VisibilityType;

  @IsNumber()
  @Column({ default: 0 })
  viewCount: number;

  @IsNumber()
  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  salesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLikes: PostLike[];

  @OneToMany(() => PurchaseList, (purchaseList) => purchaseList.post)
  purchaseLists: PurchaseList[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => DailyInsight, (dailyInsight) => dailyInsight.post)
  dailyInsights: DailyInsight[];

  @OneToMany(() => MonthlyInsight, (monthlyInsights) => monthlyInsights.post)
  monthlyInsights: MonthlyInsight[];

  @ManyToOne(() => Series, (series) => series.posts)
  series: Series;

  @ManyToOne(() => Channel, (channel) => channel.posts)
  channel: Channel;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({ name: 'posts_tags' })
  tags: Tag[];
}
