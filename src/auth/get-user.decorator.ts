import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // JwtStrategy가 토큰을 검증한 뒤 여기에 정보를 넣어줌

    return data ? user?.[data] : user;
  },
);