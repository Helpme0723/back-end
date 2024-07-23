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
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column()
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
