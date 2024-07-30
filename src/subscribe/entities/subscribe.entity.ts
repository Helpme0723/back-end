import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Channel } from 'src/channel/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('subscribes')
@Unique(['userId', 'channelId'])
export class Subscribe {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  /**
   * 구독할 채널 아이디
   * @example 1
   */
  @IsNotEmpty({ message: '구독할 체널의 아이디를 입력해 주세요.' })
  @IsNumber()
  @Type(() => Number)
  @Column({ unsigned: true })
  channelId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.subscribes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.subscribes, {
    onDelete: 'CASCADE',
  })
  channel: Channel;
}
