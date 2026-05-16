import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces';

/**
 * Custom decorator to extract the current authenticated user from the request.
 * Usage: @CurrentUser() user: UserWithoutPassword
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    return request.user ?? null;
  },
);
