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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  channelId: number;

  @Column({ nullable: true, unsigned: true })
  seriesId: number;

  @Column({ unsigned: true })
  categoryId: number;

  @Column()
  title: number;

  @Column({ type: 'text' })
  preview: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  price: number;

  @Column({ type: 'enum', enum: VisibilityType, default: VisibilityType.PUBLIC })
  visibility: VisibilityType;

  @Column({ default: 0 })
  viewCount: number;

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
