import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PointOrder } from './point-order.entity';
import { IsNumber, IsString } from 'class-validator';

@Entity('point_menu')
export class PointMenu {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 이름
   * @example "5000포인트"
   */
  @IsString()
  @Column()
  name: string;

  /**
   * 가격
   * @example 5000
   */
  @IsNumber()
  @Column()
  price: number;

  @IsString()
  @Column()
  merchantUid: string;

  @OneToMany(() => PointOrder, (pointOrder) => pointOrder.pointMenu)
  pointOrder: PointOrder[];
}
