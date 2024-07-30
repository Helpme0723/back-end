import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); // request = { id: user.id }
    console.log('여기서 확인', request.user);
    return request.user; // user: { id: user.id }
  }
);
