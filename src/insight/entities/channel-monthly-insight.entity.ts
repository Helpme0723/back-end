import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Channel } from '../../channel/entities/channel.entity';

@Entity('channel_monthly_insights')
@Unique(['channelId', 'date'])
export class ChannelMonthlyInsight {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  channelId: number;

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

  @ManyToOne(() => Channel, (channel) => channel.channelMonthlyInsights)
  channel: Channel;
}
