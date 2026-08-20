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
    get redisConfig () {
        return redisConfig;
    },
    get redisConfigSchema () {
        return redisConfigSchema;
    }
});
const _zod = require("zod");
const redisConfigSchema = _zod.z.object({
    REDIS_HOST: _zod.z.string().default('localhost'),
    REDIS_PORT: _zod.z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: _zod.z.string().optional(),
    REDIS_DB: _zod.z.coerce.number().int().min(0).default(0),
    CACHE_TTL: _zod.z.coerce.number().int().min(0).default(5000),
    UPSTASH_REDIS_REST_URL: _zod.z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: _zod.z.string().optional()
});
const redisConfig = ()=>({
        redis: redisConfigSchema.parse({
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: process.env.REDIS_PORT,
            REDIS_PASSWORD: process.env.REDIS_PASSWORD,
            REDIS_DB: process.env.REDIS_DB,
            CACHE_TTL: process.env.CACHE_TTL,
            UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
            UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN
        })
    });

//# sourceMappingURL=redis.config.js.map