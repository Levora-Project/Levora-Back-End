import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extract the request ID from the request headers.
 * Falls back to 'unknown' if no request ID is present.
 */
export const RequestId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request.headers['x-request-id'] as string) || 'unknown';
  },
);
