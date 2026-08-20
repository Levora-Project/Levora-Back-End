"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get bootstrap () {
        return bootstrap;
    },
    get default () {
        return handler;
    }
});
const _core = require("@nestjs/core");
const _config = require("@nestjs/config");
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
const _compression = /*#__PURE__*/ _interop_require_default(require("compression"));
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _nestjspino = require("nestjs-pino");
const _appmodule = require("./app.module");
const _filters = require("../dist/common/filters");
const _interceptors = require("../dist/common/interceptors");
const _responsedto = require("../dist/common/dto/response.dto");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function constraintToErrorCode(constraintKey) {
    const map = {
        isNotEmpty: _responsedto.ErrorCode.VALIDATION_REQUIRED,
        isDefined: _responsedto.ErrorCode.VALIDATION_REQUIRED,
        isEmail: _responsedto.ErrorCode.VALIDATION_INVALID_FORMAT,
        isUrl: _responsedto.ErrorCode.VALIDATION_INVALID_FORMAT,
        matches: _responsedto.ErrorCode.VALIDATION_INVALID_FORMAT,
        isEnum: _responsedto.ErrorCode.VALIDATION_INVALID_ENUM,
        isIn: _responsedto.ErrorCode.VALIDATION_INVALID_ENUM,
        minLength: _responsedto.ErrorCode.VALIDATION_TOO_SHORT,
        maxLength: _responsedto.ErrorCode.VALIDATION_TOO_LONG,
        min: _responsedto.ErrorCode.VALIDATION_TOO_SMALL,
        max: _responsedto.ErrorCode.VALIDATION_TOO_LARGE,
        isInt: _responsedto.ErrorCode.VALIDATION_INVALID_TYPE,
        isNumber: _responsedto.ErrorCode.VALIDATION_INVALID_TYPE,
        isBoolean: _responsedto.ErrorCode.VALIDATION_INVALID_TYPE,
        isString: _responsedto.ErrorCode.VALIDATION_INVALID_TYPE,
        isDate: _responsedto.ErrorCode.VALIDATION_INVALID_DATE,
        isDateString: _responsedto.ErrorCode.VALIDATION_INVALID_DATE
    };
    return map[constraintKey] ?? _responsedto.ErrorCode.VALIDATION_INVALID_FORMAT;
}
let cachedApp;
async function bootstrap() {
    if (cachedApp) {
        return cachedApp;
    }
    const app = await _core.NestFactory.create(_appmodule.AppModule, {
        bufferLogs: true
    });
    app.useLogger(app.get(_nestjspino.Logger));
    const config = app.get(_config.ConfigService);
    const prefix = config.get('app.API_PREFIX', 'api');
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.use((0, _helmet.default)());
    app.use((0, _compression.default)());
    app.use((0, _cookieparser.default)());
    app.use(_express.default.json({
        limit: '1mb'
    }));
    app.use(_express.default.urlencoded({
        extended: true,
        limit: '1mb'
    }));
    const corsOrigins = config.get('security.CORS_ORIGINS', [
        'http://localhost:3000'
    ]);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-API-Key',
            'Idempotency-Key'
        ],
        exposedHeaders: [
            'X-Request-ID',
            'X-Response-Time'
        ]
    });
    app.setGlobalPrefix(prefix);
    app.enableVersioning({
        type: _common.VersioningType.URI,
        defaultVersion: '1'
    });
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        },
        exceptionFactory: (errors)=>{
            const errList = errors.flatMap((err)=>Object.keys(err.constraints ?? {}).map((constraintKey)=>({
                        field: err.property,
                        code: constraintToErrorCode(constraintKey),
                        message: (err.constraints ?? {})[constraintKey]
                    })));
            return new _common.UnprocessableEntityException({
                message: 'Validation failed',
                errors: errList
            });
        }
    }));
    const reflector = app.get(_core.Reflector);
    app.useGlobalFilters(new _filters.AllExceptionsFilter());
    app.useGlobalInterceptors(new _interceptors.TransformInterceptor(reflector), new _interceptors.TimeoutInterceptor());
    const swaggerConfig = new _swagger.DocumentBuilder().setTitle('Levora API').setDescription('Levora Intelligent Opportunity Discovery Platform API').setVersion('1.2').addBearerAuth().addApiKey({
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header'
    }, 'X-API-Key').build();
    const document = _swagger.SwaggerModule.createDocument(app, swaggerConfig);
    _swagger.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha'
        }
    });
    app.getHttpAdapter().get('/api-json', (_req, res)=>{
        res.json(document);
    });
    app.enableShutdownHooks();
    await app.init();
    cachedApp = app;
    return app;
}
let cachedServer;
async function handler(req, res) {
    if (!cachedServer) {
        const app = await bootstrap();
        const adapter = app.getHttpAdapter();
        cachedServer = adapter.getInstance();
    }
    return cachedServer(req, res);
}
if (!process.env.VERCEL) {
    void bootstrap().then(async (app)=>{
        const config = app.get(_config.ConfigService);
        const port = config.get('app.PORT', 3000);
        const prefix = config.get('app.API_PREFIX', 'api');
        const nodeEnv = config.get('app.NODE_ENV', 'development');
        await app.listen(port);
        const logger = new _common.Logger('Bootstrap');
        logger.log(`Server running on http://localhost:${port}/${prefix}`);
        logger.log(`Environment: ${nodeEnv}`);
        logger.log(`Swagger docs: http://localhost:${port}/api`);
        logger.log(`Swagger JSON: http://localhost:${port}/api-json`);
    });
}

//# sourceMappingURL=main.js.map