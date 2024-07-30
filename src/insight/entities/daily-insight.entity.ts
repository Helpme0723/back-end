import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Channel } from '../../channel/entities/channel.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity('daily_insights')
@Unique(['postId', 'date'])
export class DailyInsight {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  channelId: number;

  @Column({ unsigned: true })
  postId: number;

  @Column()
  viewCount: number;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @Column()
  salesCount: number;

  @Column()
  date: string;

  @ManyToOne(() => Channel, (channel) => channel.dailyInsights)
  channel: Channel;

  @ManyToOne(() => Post, (post) => post.dailyInsights)
  post: Post;
}
