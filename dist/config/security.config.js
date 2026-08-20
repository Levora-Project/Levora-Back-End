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
    get securityConfig () {
        return securityConfig;
    },
    get securityConfigSchema () {
        return securityConfigSchema;
    }
});
const _zod = require("zod");
const securityConfigSchema = _zod.z.object({
    CORS_ORIGINS: _zod.z.string().default('http://localhost:3000').transform((val)=>val.split(',')),
    THROTTLE_TTL: _zod.z.coerce.number().default(60000),
    THROTTLE_LIMIT: _zod.z.coerce.number().default(100),
    JWT_SECRET: _zod.z.string().min(32, 'JWT_SECRET must be at least 32 characters').default(process.env.NODE_ENV === 'production' ? undefined // force validation failure in production
     : 'dev-only-secret-do-not-use-in-production!!'),
    JWT_ACCESS_EXPIRES: _zod.z.string().default('15m'),
    JWT_REFRESH_EXPIRES: _zod.z.string().default('7d'),
    COOKIE_DOMAIN: _zod.z.string().optional(),
    COOKIE_SECURE: _zod.z.string().default('false').transform((val)=>val === 'true')
});
const securityConfig = ()=>({
        security: securityConfigSchema.parse({
            CORS_ORIGINS: process.env.CORS_ORIGINS,
            THROTTLE_TTL: process.env.THROTTLE_TTL,
            THROTTLE_LIMIT: process.env.THROTTLE_LIMIT,
            JWT_SECRET: process.env.JWT_SECRET,
            JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
            JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
            COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
            COOKIE_SECURE: process.env.COOKIE_SECURE
        })
    });

//# sourceMappingURL=security.config.js.map