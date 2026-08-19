import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  ValidationPipe,
  VersioningType,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters';
import { TransformInterceptor, TimeoutInterceptor } from '@common/interceptors';
import { ErrorCode } from '@common/dto/response.dto';
import { Reflector } from '@nestjs/core';

function constraintToErrorCode(constraintKey: string): string {
  const map: Record<string, string> = {
    isNotEmpty:    ErrorCode.VALIDATION_REQUIRED,
    isDefined:     ErrorCode.VALIDATION_REQUIRED,
    isEmail:       ErrorCode.VALIDATION_INVALID_FORMAT,
    isUrl:         ErrorCode.VALIDATION_INVALID_FORMAT,
    matches:       ErrorCode.VALIDATION_INVALID_FORMAT,
    isEnum:        ErrorCode.VALIDATION_INVALID_ENUM,
    isIn:          ErrorCode.VALIDATION_INVALID_ENUM,
    minLength:     ErrorCode.VALIDATION_TOO_SHORT,
    maxLength:     ErrorCode.VALIDATION_TOO_LONG,
    min:           ErrorCode.VALIDATION_TOO_SMALL,
    max:           ErrorCode.VALIDATION_TOO_LARGE,
    isInt:         ErrorCode.VALIDATION_INVALID_TYPE,
    isNumber:      ErrorCode.VALIDATION_INVALID_TYPE,
    isBoolean:     ErrorCode.VALIDATION_INVALID_TYPE,
    isString:      ErrorCode.VALIDATION_INVALID_TYPE,
    isDate:        ErrorCode.VALIDATION_INVALID_DATE,
    isDateString:  ErrorCode.VALIDATION_INVALID_DATE,
  };
  return map[constraintKey] ?? ErrorCode.VALIDATION_INVALID_FORMAT;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ── Structured logging (pino) ──────────────────
  app.useLogger(app.get(PinoLogger));

  const config = app.get(ConfigService);
  const port = config.get<number>('app.PORT', 3000);
  const prefix = config.get<string>('app.API_PREFIX', 'api');
  const nodeEnv = config.get<string>('app.NODE_ENV', 'development');

  // ── Security ───────────────────────────────────
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ── Request body size limits ────────────────────
  const express = await import('express');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  const corsOrigins = config.get<string[]>('security.CORS_ORIGINS', [
    'http://localhost:3000',
  ]);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-API-Key',
      'Idempotency-Key',
    ],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
  });

  // ── Global prefix & versioning ─────────────────
  app.setGlobalPrefix(prefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ── Global pipes ───────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const errList = errors.flatMap((err) =>
          Object.keys(err.constraints ?? {}).map((constraintKey) => ({
            field: err.property,
            code: constraintToErrorCode(constraintKey),
            message: (err.constraints ?? {})[constraintKey],
          })),
        );
        return new UnprocessableEntityException({
          message: 'Validation failed',
          errors: errList,
        });
      },
    }),
  );

  // ── Global filters & interceptors ──────────────
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(reflector),
    new TimeoutInterceptor(),
  );

  // ── Swagger (non-production only) ──────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AI Hub Backend API')
      .setDescription('API documentation for AI Hub Backend')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey(
        { type: 'apiKey', name: 'X-API-Key', in: 'header' },
        'X-API-Key',
      )
      .addServer(`http://localhost:${port}`)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${prefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ── Graceful shutdown ──────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Server running on http://localhost:${port}/${prefix}`);
  logger.log(`📖 Environment: ${nodeEnv}`);
  if (nodeEnv !== 'production') {
    logger.log(`📚 Swagger docs: http://localhost:${port}/${prefix}/docs`);
  }
}

void bootstrap();
