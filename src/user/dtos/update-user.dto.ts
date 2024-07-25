import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, ValidateIf } from 'class-validator';

export class UpdateUserDto extends PickType(User, ['nickname', 'password', 'profileUrl', 'description']) {}
