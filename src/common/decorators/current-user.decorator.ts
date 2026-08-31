import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: Record<string, unknown>;
}

/**
 * Extract the current authenticated user from the request.
 *
 * Usage:
 *   @CurrentUser()        → full user object
 *   @CurrentUser('id')    → user.id
 *   @CurrentUser('email') → user.email
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return field && user ? user[field] : user;
  },
);
