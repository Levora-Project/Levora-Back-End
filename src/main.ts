import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import {
  ValidationPipe,
  VersioningType,
  Logger,
  UnprocessableEntityException,
  INestApplication,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { Express, Request, Response } from 'express';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters';
import { TransformInterceptor, TimeoutInterceptor } from '@common/interceptors';
import { ErrorCode } from '@common/dto/response.dto';

function constraintToErrorCode(constraintKey: string): string {
  const map: Record<string, string> = {
    isNotEmpty: ErrorCode.VALIDATION_REQUIRED,
    isDefined: ErrorCode.VALIDATION_REQUIRED,
    isEmail: ErrorCode.VALIDATION_INVALID_FORMAT,
    isUrl: ErrorCode.VALIDATION_INVALID_FORMAT,
    matches: ErrorCode.VALIDATION_INVALID_FORMAT,
    isEnum: ErrorCode.VALIDATION_INVALID_ENUM,
    isIn: ErrorCode.VALIDATION_INVALID_ENUM,
    minLength: ErrorCode.VALIDATION_TOO_SHORT,
    maxLength: ErrorCode.VALIDATION_TOO_LONG,
    min: ErrorCode.VALIDATION_TOO_SMALL,
    max: ErrorCode.VALIDATION_TOO_LARGE,
    isInt: ErrorCode.VALIDATION_INVALID_TYPE,
    isNumber: ErrorCode.VALIDATION_INVALID_TYPE,
    isBoolean: ErrorCode.VALIDATION_INVALID_TYPE,
    isString: ErrorCode.VALIDATION_INVALID_TYPE,
    isDate: ErrorCode.VALIDATION_INVALID_DATE,
    isDateString: ErrorCode.VALIDATION_INVALID_DATE,
  };
  return map[constraintKey] ?? ErrorCode.VALIDATION_INVALID_FORMAT;
}

let cachedServer: Express;
let cachedApp: INestApplication;

async function bootstrapServer(): Promise<{
  app: INestApplication;
  server: Express;
}> {
  if (cachedApp && cachedServer) {
    return { app: cachedApp, server: cachedServer };
  }

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));

  const config = app.get(ConfigService);
  const prefix = config.get<string>('app.API_PREFIX', 'api');

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

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

  app.setGlobalPrefix(prefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

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

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(reflector),
    new TimeoutInterceptor(),
  );

  // ── Swagger ─────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Levora API')
    .setDescription('Levora Intelligent Opportunity Discovery Platform API')
    .setVersion('1.2')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Serve swagger JSON at /api-json
  app
    .getHttpAdapter()
    .get(
      '/api-json',
      (_req: unknown, res: { json: (data: unknown) => void }) => {
        res.json(document);
      },
    );

  app.enableShutdownHooks();

  await app.init();
  cachedApp = app;
  cachedServer = server;

  return { app, server };
}

// Serverless function handler for Vercel
export default async function handler(req: Request, res: Response) {
  const { server } = await bootstrapServer();
  return server(req, res);
}

// Standalone server for local development
if (!process.env.VERCEL) {
  void bootstrapServer().then(async ({ app }) => {
    const config = app.get(ConfigService);
    const port = config.get<number>('app.PORT', 3000);
    const prefix = config.get<string>('app.API_PREFIX', 'api');
    const nodeEnv = config.get<string>('app.NODE_ENV', 'development');

    await app.listen(port);

    const logger = new Logger('Bootstrap');
    logger.log(`🚀 Server running on http://localhost:${port}/${prefix}`);
    logger.log(`📖 Environment: ${nodeEnv}`);
    logger.log(`📚 Swagger docs: http://localhost:${port}/api`);
    logger.log(`📄 Swagger JSON: http://localhost:${port}/api-json`);
  });
}
