import { Channel } from 'src/channel/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('subscribes')
@Unique(['userId', 'channelId'])
export class Subscribe {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  channelId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.subscribes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.subscribes, { onDelete: 'CASCADE' })
  channel: Channel;
}
