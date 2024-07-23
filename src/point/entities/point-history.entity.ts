import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PointHistoryType } from '../types/point-history.type';

@Entity('point_histories')
export class PointHistory {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: PointHistoryType })
  type: PointHistoryType; // 수정 필요

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => User, (user) => user.pointHistories)
  user: User;
}
