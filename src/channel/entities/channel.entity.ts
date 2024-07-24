import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { Post } from 'src/post/entities/post.entity';
import { Series } from 'src/series/entities/series.entity';
import { Subscribe } from 'src/subscribe/entities/subscribe.entity';
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

@Entity('channels')
export class Channel {
  /**
   * 채널 아이디
   * @example 1
   */
  @IsNotEmpty({ message: '조회할 채널의 아이디를 입력해 주세요.' })
  @IsNumber()
  @Type(() => Number)
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /**
   * 유저 아이디
   * @example 1
   */
  @IsNotEmpty({ message: '채널을 조회할 유저의 아이디를 입력해 주세요.' })
  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNotEmpty({ message: '채널명을 입력해주세요.' })
  @Max(30, { message: '채널명을 최대 30글자까지 입력 가능합니다.' })
  @IsString()
  @Column()
  title: string;

  @IsNotEmpty({ message: '채널 소개 입력해 주세요.' })
  @Max(200, { message: '채널 소개는 최대 200글자까지 입력 가능합니다.' })
  @IsString()
  @Column()
  description: string;

  @IsOptional()
  @Column()
  imageUrl: string;

  @Column({ default: 0 })
  subscribers: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Subscribe, (subscribe) => subscribe.channel)
  subscribes: Subscribe[];

  @OneToMany(() => Post, (post) => post.channel, { cascade: ['soft-remove'] })
  posts: Post[];

  @OneToMany(() => Series, (series) => series.channel, { cascade: ['soft-remove'] })
  series: Series[];

  @ManyToOne(() => User, (user) => user.channels)
  user: User;
}
