import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('search')
export class Search {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column()
  keyword: string;

  @IsNumber()
  @Column()
  count: number;
}
