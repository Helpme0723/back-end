import { IsNumber, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointMenu } from './point-menu-entity';
import { PaymentType } from 'src/payments/types/payment.type';

@Entity('point_order')
export class PointOrder {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNumber()
  @Column({ unsigned: true })
  pointMenuId: number;

  @IsNumber()
  @Column()
  amount: number;

  @IsString()
  @Column()
  merchantUid: string;

  @IsString()
  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.PENDING })
  status: PaymentType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.pointOrder)
  user: User;

  @ManyToOne(() => PointMenu, (pointMenu) => pointMenu.pointOrder)
  pointMenu: PointMenu;
}
