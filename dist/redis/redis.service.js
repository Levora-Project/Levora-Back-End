"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedisService", {
    enumerable: true,
    get: function() {
        return RedisService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _ioredis = /*#__PURE__*/ _interop_require_default(require("ioredis"));
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
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
let RedisService = class RedisService {
    async onModuleInit() {
        if (process.env.VERCEL) {
            this.logger.log('Running on Vercel: skipping persistent TCP Redis connection.');
            return;
        }
        try {
            this.logger.log('Connecting to Redis...');
            await this.client.connect();
            this.logger.log('Redis connected');
        } catch (err) {
            this.logger.warn(`Failed to connect to Redis: ${err.message}. Continuing without persistent TCP Redis connection.`);
        }
    }
    async onModuleDestroy() {
        try {
            if (this.client.status === 'ready' || this.client.status === 'connecting') {
                this.logger.log('Disconnecting from Redis...');
                await this.client.quit();
                this.logger.log('Redis disconnected');
            }
        } catch  {
        // Ignore disconnect errors during teardown
        }
    }
    // ── Health Check ─────────────────────────────
    async isHealthy() {
        try {
            if (this.client.status !== 'ready') {
                return false;
            }
            const result = await this.client.ping();
            return result === 'PONG';
        } catch  {
            return false;
        }
    }
    constructor(configService){
        this.logger = new _common.Logger(RedisService.name);
        this.client = new _ioredis.default({
            host: configService.get('redis.REDIS_HOST', 'localhost'),
            port: configService.get('redis.REDIS_PORT', 6379),
            password: configService.get('redis.REDIS_PASSWORD') || undefined,
            db: configService.get('redis.REDIS_DB', 0),
            lazyConnect: true
        });
    }
};
RedisService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], RedisService);

//# sourceMappingURL=redis.service.js.map