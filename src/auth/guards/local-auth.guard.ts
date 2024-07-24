import { AuthGuard } from '@nestjs/passport';
// local.strategy.ts 상속
export class LocalAuthGuard extends AuthGuard('local') {}
