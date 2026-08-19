import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '@common/dto';
import { toApiDatetime } from '@common/utils/datetime.util';

interface IdempotencyRecord {
  key: string;
  requestHash: string;
  status: 'processing' | 'completed';
  statusCode?: number;
  responseBody?: string;
  createdAt: number;
  expiresAt: number;
}

const IDEMPOTENCY_TTL_MS = 86_400_000;
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IdempotencyMiddleware.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
      next();
      return;
    }

    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      next();
      return;
    }

    if (!UUID_V4_REGEX.test(idempotencyKey)) {
      this.sendError(
        req,
        res,
        422,
        'Validation failed',
        ErrorCode.VALIDATION_INVALID_FORMAT,
        'Idempotency-Key must be a valid UUID v4',
        'idempotency-key',
      );
      return;
    }

    const requestHash = createHash('sha256')
      .update(`${req.method}:${req.path}:${JSON.stringify(req.body ?? {})}`)
      .digest('hex');

    const cacheKey = `idempotency:${idempotencyKey}`;

    try {
      const existingRecord = await this.cache.get<IdempotencyRecord>(cacheKey);

      if (existingRecord) {
        if (existingRecord.requestHash !== requestHash) {
          this.sendError(
            req,
            res,
            422,
            'Idempotency key conflict',
            ErrorCode.SYSTEM_IDEMPOTENCY_KEY_CONFLICT,
            'Idempotency-Key was already used with a different request payload',
          );
          return;
        }

        if (existingRecord.status === 'processing') {
          this.sendError(
            req,
            res,
            409,
            'Request already in progress',
            ErrorCode.SYSTEM_REQUEST_IN_PROGRESS,
            'A request with this Idempotency-Key is still processing',
          );
          return;
        }

        if (
          existingRecord.status === 'completed' &&
          typeof existingRecord.responseBody === 'string'
        ) {
          res.setHeader('Idempotent-Replayed', 'true');

          let parsedBody: unknown = existingRecord.responseBody;
          try {
            parsedBody = JSON.parse(existingRecord.responseBody);
          } catch {
            // Keep raw string when cached payload is not valid JSON.
          }

          res.status(existingRecord.statusCode ?? 200).json(parsedBody);
          return;
        }
      }

      const now = Date.now();
      const processingRecord: IdempotencyRecord = {
        key: idempotencyKey,
        requestHash,
        status: 'processing',
        createdAt: now,
        expiresAt: now + IDEMPOTENCY_TTL_MS,
      };

      await this.cache.set(cacheKey, processingRecord, IDEMPOTENCY_TTL_MS);

      const originalJson = res.json.bind(res);
      res.json = (body: unknown): Response => {
        const completedRecord: IdempotencyRecord = {
          ...processingRecord,
          status: 'completed',
          statusCode: res.statusCode,
          responseBody: JSON.stringify(body),
        };

        void this.cache
          .set(cacheKey, completedRecord, IDEMPOTENCY_TTL_MS)
          .catch((error: unknown) => {
            this.logger.error(
              {
                error,
                idempotencyKey,
                path: req.path,
                method: req.method,
              },
              'Failed to persist completed idempotency record',
            );
          });

        return originalJson(body);
      };
    } catch (error) {
      this.logger.error(
        {
          error,
          idempotencyKey,
          path: req.path,
          method: req.method,
        },
        'Idempotency cache unavailable, continuing without idempotency enforcement',
      );
    }

    next();
  }

  private sendError(
    req: Request,
    res: Response,
    status: number,
    message: string,
    code: ErrorCode,
    detail: string,
    field?: string,
  ): void {
    const requestId = req.headers['x-request-id'];
    if (typeof requestId === 'string' && requestId.length > 0) {
      res.setHeader('X-Request-ID', requestId);
    }

    res.status(status).json({
      success: false,
      status,
      message,
      data: null,
      meta: null,
      errors: [
        {
          ...(field ? { field } : {}),
          code,
          message: detail,
        },
      ],
      timestamp: toApiDatetime(new Date()),
    });
  }
}
