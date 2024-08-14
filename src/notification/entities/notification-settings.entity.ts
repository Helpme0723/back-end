import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notificationSettings, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ default: true })
  commentNotifications: boolean;

  @Column({ default: true })
  commentlikeNotifications: boolean;

  @Column({ default: true })
  postLikeNotifications: boolean;
}