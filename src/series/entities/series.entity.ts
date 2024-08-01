import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Channel } from 'src/channel/entities/channel.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('series')
export class Series {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  /**
   * 채널아이디
   * @example 1
   */
  @IsNotEmpty()
  @IsNumber()
  @Column({ unsigned: true })
  channelId: number;

  /**
   * 시리즈 제목
   * @example "시리즈제목입니다"
   */
  @IsNotEmpty()
  @IsString()
  @Column()
  title: string;

  /**
   * 시리즈 설명
   * @example "시리즈 설명입니다"
   */
  @IsNotEmpty()
  @IsString()
  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.series)
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.series)
  channel: Channel;

  @OneToMany(() => Post, (post) => post.series)
  posts: Post[];
}
