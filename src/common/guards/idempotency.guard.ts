import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '@common/dto';
import { REQUIRE_IDEMPOTENCY_KEY } from '@common/decorators';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresIdempotency = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_IDEMPOTENCY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresIdempotency) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const idempotencyKey = request.headers['idempotency-key'];

    if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: [
          {
            field: 'idempotency-key',
            code: ErrorCode.VALIDATION_REQUIRED,
            message: 'Idempotency-Key header is required',
          },
        ],
      });
    }

    return true;
  }
}
