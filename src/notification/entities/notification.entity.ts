// src/notifications/entities/notification.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  message: string;

  @Column({ nullable: true })  // 포스트 ID를 저장하는 컬럼
  postId?: number;

  @Column({ nullable: true })
  channelId?: number;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
