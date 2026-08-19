import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';
import {
  DEPRECATED_KEY,
  DeprecatedOptions,
} from '@common/decorators/deprecated.decorator';
import { RESPONSE_MESSAGE_KEY } from '@common/decorators/response-message.decorator';
import { toApiDatetime } from '@common/utils/datetime.util';

type RequestWithMeta = Request & { generatedRequestId?: boolean };

interface PaginatedShape {
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function isPaginated(value: unknown): value is PaginatedShape {
  return (
    value !== null &&
    typeof value === 'object' &&
    'data' in value &&
    'total' in value &&
    'page' in value &&
    'hasNext' in value
  );
}

function getAutoMessage(method: string, statusCode: number): string {
  if (statusCode === 201) return 'Created successfully';
  if (method === 'PATCH' || method === 'PUT') return 'Updated successfully';
  return 'OK';
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithMeta>();
    const response = httpContext.getResponse<Response>();
    const serverGeneratedId = request.generatedRequestId === true;
    const requestId = request.headers['x-request-id'] as string | undefined;

    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const deprecatedOptions = this.reflector.getAllAndOverride<
      DeprecatedOptions | undefined
    >(DEPRECATED_KEY, [context.getHandler(), context.getClass()]);

    return next.handle().pipe(
      map((responseData) => {
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        if (requestId) {
          response.setHeader('X-Request-ID', requestId);
        }
        response.setHeader('X-Response-Time', `${duration}ms`);

        const deprecationMeta = deprecatedOptions
          ? {
              message:
                'This endpoint is deprecated and will be removed in a future version.',
              sunsetDate: new Date(deprecatedOptions.sunsetDate).toISOString(),
              replacement: deprecatedOptions.replacement,
            }
          : undefined;
        if (deprecatedOptions) {
          response.setHeader('Deprecation', 'true');
          response.setHeader(
            'Sunset',
            new Date(deprecatedOptions.sunsetDate).toUTCString(),
          );
          response.setHeader(
            'Link',
            `<${deprecatedOptions.replacement}>; rel="successor-version"`,
          );
        }

        const requestIdMeta =
          serverGeneratedId && requestId ? { requestId } : undefined;

        const timestamp = toApiDatetime(new Date());
        const message =
          customMessage || getAutoMessage(request.method, statusCode);

        if (isPaginated(responseData)) {
          const { data, total, page, limit, totalPages, hasNext, hasPrev } =
            responseData;
          return {
            success: true,
            status: statusCode,
            message,
            data,
            meta: {
              pagination: { page, limit, total, totalPages, hasNext, hasPrev },
              ...requestIdMeta,
              ...(deprecationMeta ? { deprecation: deprecationMeta } : {}),
            },
            errors: null,
            timestamp,
          };
        }

        return {
          success: true,
          status: statusCode,
          message,
          data: responseData,
          meta:
            requestIdMeta || deprecationMeta
              ? {
                  ...requestIdMeta,
                  ...(deprecationMeta ? { deprecation: deprecationMeta } : {}),
                }
              : null,
          errors: null,
          timestamp,
        };
      }),
    );
  }
}
