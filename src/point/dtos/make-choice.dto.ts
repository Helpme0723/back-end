import { PickType } from '@nestjs/swagger';
import { PointMenu } from '../entities/point-menu-entity';

export class MakeChoiceDto extends PickType(PointMenu, ['name', 'price', 'merchantUid']) {}
