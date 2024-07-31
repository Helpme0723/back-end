import { IsNumber } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PointMenu } from './point-menu-entity';

@Entity('point_order')
export class PointOrder {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNumber()
  @Column({ unsigned: true })
  userId: number;

  @IsNumber()
  @Column()
  amount: number;

  @CreateDateColumn()
  createAt: Date;

  @ManyToOne(() => User, (user) => user.pointOrder)
  user: User;

  @ManyToOne(() => PointMenu, (pointMenu) => pointMenu.pointOrder)
  pointMenu: PointMenu;
}
