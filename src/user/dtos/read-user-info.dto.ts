import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ReadUserInfoDto extends PickType(User, ['id']) {}
