import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract optional user from request
 * Returns undefined if no user is authenticated
 */
export const OptionalUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub; // sub contains userId
  },
);
