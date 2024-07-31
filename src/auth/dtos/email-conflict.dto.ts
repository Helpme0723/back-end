import { PickType } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class EmailConflictDto extends PickType(User, ['email']) {}
