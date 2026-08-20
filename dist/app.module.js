"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _cachemanager = require("@nestjs/cache-manager");
const _bullmq = require("@nestjs/bullmq");
const _throttler = require("@nestjs/throttler");
const _core = require("@nestjs/core");
const _nestjspino = require("nestjs-pino");
const _keyv = require("keyv");
const _redis = /*#__PURE__*/ _interop_require_default(require("@keyv/redis"));
const _cacheable = require("cacheable");
const _crypto = require("crypto");
const _keyvupstashredisstore = require("./common/cache/keyv-upstash-redis.store");
const _index = require("../dist/config/index");
const _prisma = require("../dist/prisma");
const _redis1 = require("../dist/redis");
const _health = require("../dist/modules/health");
const _users = require("../dist/modules/users");
const _auth = require("../dist/modules/auth");
const _guards = require("../dist/common/guards");
const _middleware = require("../dist/common/middleware");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(_middleware.RequestIdMiddleware, _middleware.IdempotencyMiddleware).forRoutes('*');
    }
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            // ── Configuration ────────────────────────────
            _config.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    _index.appConfig,
                    _index.databaseConfig,
                    _index.logConfig,
                    _index.redisConfig,
                    _index.securityConfig,
                    _index.uploadConfig
                ],
                envFilePath: [
                    '.env'
                ]
            }),
            // ── Structured Logging (Pino) ────────────────
            _nestjspino.LoggerModule.forRootAsync({
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>{
                    const nodeEnv = config.get('app.NODE_ENV', 'development');
                    const appName = config.get('app.APP_NAME', 'ai-hub');
                    const logDir = config.get('log.LOG_DIR', './logs');
                    const logMaxSize = config.get('log.LOG_MAX_SIZE', '10m');
                    const logFrequency = config.get('log.LOG_FREQUENCY', 'daily');
                    const logMaxFiles = config.get('log.LOG_MAX_FILES', 30);
                    const logFileEnabled = config.get('log.LOG_FILE_ENABLED', true);
                    // Parse size string (e.g. "10m") to bytes
                    const parseSizeToBytes = (size)=>{
                        const match = size.match(/^(\d+)([kmg]?)$/i);
                        if (!match) {
                            return 10 * 1024 * 1024;
                        }
                        const num = parseInt(match[1], 10);
                        const unit = match[2]?.toLowerCase();
                        const multipliers = {
                            k: 1024,
                            m: 1024 ** 2,
                            g: 1024 ** 3
                        };
                        return num * (multipliers[unit] || 1);
                    };
                    // Parse frequency string to milliseconds or keep as-is for pino-roll
                    const parseFrequency = (freq)=>{
                        if (freq === 'daily') {
                            return 86400000;
                        }
                        if (freq === 'hourly') {
                            return 3600000;
                        }
                        const ms = parseInt(freq, 10);
                        return isNaN(ms) ? 86400000 : ms;
                    };
                    // File transport: all logs → {appName}.log
                    const fileTransport = {
                        target: 'pino-roll',
                        options: {
                            file: `${logDir}/${appName}.log`,
                            frequency: parseFrequency(logFrequency),
                            size: parseSizeToBytes(logMaxSize),
                            limit: {
                                count: logMaxFiles
                            },
                            mkdir: true,
                            dateFormat: 'yyyy-MM-dd-HH-mm'
                        }
                    };
                    // File transport: errors only → {appName}-error.log
                    const errorFileTransport = {
                        target: 'pino-roll',
                        level: 'error',
                        options: {
                            file: `${logDir}/${appName}-error.log`,
                            frequency: parseFrequency(logFrequency),
                            size: parseSizeToBytes(logMaxSize),
                            limit: {
                                count: logMaxFiles
                            },
                            mkdir: true,
                            dateFormat: 'yyyy-MM-dd-HH-mm'
                        }
                    };
                    // Development: pretty console + file logs
                    // Production: structured JSON to stdout (docker logs / kubectl logs)
                    //   Set LOG_FILE_ENABLED=true to also write file logs
                    const transport = nodeEnv !== 'production' ? {
                        targets: [
                            {
                                target: 'pino-pretty',
                                options: {
                                    colorize: true
                                },
                                level: 'debug'
                            },
                            {
                                ...fileTransport,
                                level: 'debug'
                            },
                            errorFileTransport
                        ]
                    } : {
                        targets: [
                            {
                                target: 'pino/file',
                                options: {
                                    destination: 1
                                },
                                level: 'info'
                            },
                            ...logFileEnabled ? [
                                {
                                    ...fileTransport,
                                    level: 'info'
                                },
                                errorFileTransport
                            ] : []
                        ]
                    };
                    return {
                        pinoHttp: {
                            level: nodeEnv === 'production' ? 'info' : 'debug',
                            transport,
                            autoLogging: true,
                            redact: [
                                'req.headers.authorization',
                                'req.headers.cookie',
                                'res.headers["set-cookie"]'
                            ],
                            // Attach X-Request-ID to every log line
                            genReqId: (req, res)=>{
                                const existing = req.headers['x-request-id'];
                                const id = (typeof existing === 'string' ? existing : undefined) || (0, _crypto.randomUUID)();
                                req.headers['x-request-id'] = id;
                                res.setHeader('x-request-id', id);
                                if (typeof existing !== 'string') {
                                    req.generatedRequestId = true;
                                }
                                return id;
                            },
                            // Serialize errors with full stack trace
                            serializers: {
                                err: (err)=>({
                                        type: err.constructor?.name || 'Error',
                                        message: err.message,
                                        stack: err.stack,
                                        ...err.code ? {
                                            code: err.code
                                        } : {},
                                        ...err.statusCode ? {
                                            statusCode: err.statusCode
                                        } : {}
                                    })
                            }
                        }
                    };
                }
            }),
            // ── Rate Limiting ────────────────────────────
            _throttler.ThrottlerModule.forRootAsync({
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>({
                        throttlers: [
                            {
                                ttl: config.get('security.THROTTLE_TTL', 60000),
                                limit: config.get('security.THROTTLE_LIMIT', 100)
                            }
                        ]
                    })
            }),
            // ── Database ─────────────────────────────────
            _prisma.PrismaModule,
            // ── Redis ────────────────────────────────────
            _redis1.RedisModule,
            // ── Caching (Environment-aware: Upstash / Keyv / Memory) ──
            _cachemanager.CacheModule.registerAsync({
                isGlobal: true,
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>{
                    const upstashUrl = config.get('redis.UPSTASH_REDIS_REST_URL');
                    const upstashToken = config.get('redis.UPSTASH_REDIS_REST_TOKEN');
                    const host = config.get('redis.REDIS_HOST', 'localhost');
                    const port = config.get('redis.REDIS_PORT', 6379);
                    const password = config.get('redis.REDIS_PASSWORD');
                    const db = config.get('redis.REDIS_DB', 0);
                    const ttl = config.get('redis.CACHE_TTL', 5000);
                    const isVercel = Boolean(process.env.VERCEL);
                    const isProd = config.get('app.NODE_ENV') === 'production';
                    const stores = [
                        new _keyv.Keyv({
                            store: new _cacheable.CacheableMemory({
                                ttl: 60000,
                                lruSize: 5000
                            })
                        })
                    ];
                    if (upstashUrl && upstashToken) {
                        stores.push(new _keyv.Keyv({
                            store: new _keyvupstashredisstore.KeyvUpstashStore({
                                url: upstashUrl,
                                token: upstashToken
                            })
                        }));
                    } else if (!isVercel && !isProd) {
                        const credentials = password ? `:${password}@` : '';
                        const redisUrl = `redis://${credentials}${host}:${port}/${db}`;
                        stores.push(new _keyv.Keyv({
                            store: new _redis.default(redisUrl)
                        }));
                    }
                    return {
                        ttl,
                        stores
                    };
                }
            }),
            // ── Queues (BullMQ + Redis) ──────────────────
            _bullmq.BullModule.forRootAsync({
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>({
                        connection: {
                            host: config.get('redis.REDIS_HOST', 'localhost'),
                            port: config.get('redis.REDIS_PORT', 6379),
                            password: config.get('redis.REDIS_PASSWORD') || undefined,
                            db: config.get('redis.REDIS_DB', 0),
                            lazyConnect: true,
                            enableOfflineQueue: false,
                            maxRetriesPerRequest: null
                        }
                    })
            }),
            // ── Feature Modules ──────────────────────────
            _health.HealthModule,
            _auth.AuthModule,
            _users.UsersModule
        ],
        providers: [
            // Global throttler guard
            {
                provide: _core.APP_GUARD,
                useClass: _throttler.ThrottlerGuard
            },
            // Global auth guard (JWT + API key, skips @Public())
            {
                provide: _core.APP_GUARD,
                useClass: _guards.AuthGuard
            },
            // Global roles guard (checks @Roles() decorator)
            {
                provide: _core.APP_GUARD,
                useClass: _guards.RolesGuard
            },
            // Global idempotency guard (enforces @RequireIdempotency())
            {
                provide: _core.APP_GUARD,
                useClass: _guards.IdempotencyGuard
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map