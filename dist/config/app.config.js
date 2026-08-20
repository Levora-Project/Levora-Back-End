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
    get appConfig () {
        return appConfig;
    },
    get appConfigSchema () {
        return appConfigSchema;
    }
});
const _zod = require("zod");
const appConfigSchema = _zod.z.object({
    NODE_ENV: _zod.z.enum([
        'development',
        'production',
        'test'
    ]).default('development'),
    PORT: _zod.z.coerce.number().default(3000),
    APP_NAME: _zod.z.string().default('ai-hub'),
    API_PREFIX: _zod.z.string().default('api')
});
const appConfig = ()=>({
        app: appConfigSchema.parse({
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            APP_NAME: process.env.APP_NAME,
            API_PREFIX: process.env.API_PREFIX
        })
    });

//# sourceMappingURL=app.config.js.map