import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract current user from request
 * Works with JWT payload attached by JwtAuthGuard
 *
 * Usage:
 * @CurrentUser() userId: string         // Gets the 'sub' field (user ID)
 * @CurrentUser('username') username: string  // Gets specific field
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user.sub;
  }
);
