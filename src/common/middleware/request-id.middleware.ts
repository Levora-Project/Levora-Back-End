import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Adds X-Request-ID header to every request for traceability.
 * If the client already provides one, it is preserved.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] as string | undefined;
    if (requestId) {
      res.setHeader('X-Request-ID', requestId);
    }
    next();
  }
}
