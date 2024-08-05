import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
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
import { DailyInsight } from '../../insight/entities/daily-insight.entity';
import { MonthlyInsight } from '../../insight/entities/monthly-insight.entity';
import { ChannelDailyInsight } from 'src/insight/entities/channel-daily-insight.entity';
import { ChannelMonthlyInsight } from 'src/insight/entities/channel-monthly-insight.entity';

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
  @Type(() => Number)
  @Column({ unsigned: true })
  userId: number;

  /**
   * 채널명
   * @example "채널 생성 테스트"
   */
  @IsNotEmpty({ message: '채널명을 입력해주세요.' })
  @MaxLength(30, { message: '채널명을 최대 30글자까지 입력 가능합니다.' })
  @IsString()
  @Column()
  title: string;

  /**
   * 채널 소개
   * @example "채널 생성 테스트입니다."
   */
  @IsNotEmpty({ message: '채널 소개를 입력해 주세요.' })
  @MaxLength(200, { message: '채널 소개는 최대 200글자까지 입력 가능합니다.' })
  @IsString()
  @Column()
  description: string;

  @IsOptional()
  @IsString()
  @Column({
    default:
      'https://talentversebucket.s3.ap-northeast-2.amazonaws.com/10ebcc18-43fc-4f94-8e44-4cd95422a84d.png',
  })
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

  @OneToMany(() => Post, (post) => post.channel, { cascade: true })
  posts: Post[];

  @OneToMany(() => Series, (series) => series.channel, { cascade: true })
  series: Series[];

  @OneToMany(() => DailyInsight, (dailyInsight) => dailyInsight.channel)
  dailyInsights: DailyInsight[];

  @OneToMany(() => MonthlyInsight, (monthlyInsights) => monthlyInsights.channel)
  monthlyInsights: MonthlyInsight[];

  @OneToMany(
    () => ChannelDailyInsight,
    (channelDailyInsight) => channelDailyInsight.channel
  )
  channelDailyInsights: ChannelDailyInsight[];

  @OneToMany(
    () => ChannelMonthlyInsight,
    (channelMonthlyInsight) => channelMonthlyInsight.channel
  )
  channelMonthlyInsights: ChannelMonthlyInsight[];

  @ManyToOne(() => User, (user) => user.channels)
  user: User;
}
