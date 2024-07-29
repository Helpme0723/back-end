import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PointHistoryType } from '../types/point-history.type';
import { IsNumber, IsString } from 'class-validator';

@Entity('point_histories')
export class PointHistory {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNumber()
  @Column({ unsigned: true })
  postId: number;

  @IsNumber()
  @Column()
  amount: number;

  @Column({ type: 'enum', enum: PointHistoryType })
  type: PointHistoryType;

  @IsString()
  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => User, (user) => user.pointHistories)
  user: User;
}
