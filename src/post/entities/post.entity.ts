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
import { VisibiltyType } from '../types/post.type';
import { IsEnum, IsNumber, IsString } from 'class-validator';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNumber()
  @Column({ unsigned: true })
  channelId: number;

  @IsNumber()
  @Column({ nullable: true, unsigned: true })
  seriesId: number;

  @IsNumber()
  @Column({ unsigned: true })
  categoryId: number;

  @IsString()
  @Column()
  title: number;

  @IsString()
  @Column({ type: 'text' })
  preview: string;

  @IsString()
  @Column({ type: 'text' })
  content: string;

  @IsNumber()
  @Column({ default: 0 })
  price: number;

  @IsEnum({ enum: VisibiltyType })
  @Column({ type: 'enum', enum: VisibiltyType, default: VisibiltyType.PUBLIC })
  visibility: VisibiltyType;

  @IsNumber()
  @Column({ default: 0 })
  viewCount: number;

  @IsNumber()
  @Column({ default: 0 })
  likeCount: number;

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

  @ManyToOne(() => Series, (series) => series.posts)
  series: Series;

  @ManyToOne(() => Channel, (channel) => channel.posts)
  channel: Channel;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({ name: 'posts_tags' })
  tags: Tag[];
}
