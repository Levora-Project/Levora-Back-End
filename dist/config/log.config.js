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
    get logConfig () {
        return logConfig;
    },
    get logConfigSchema () {
        return logConfigSchema;
    }
});
const _zod = require("zod");
const logConfigSchema = _zod.z.object({
    LOG_DIR: _zod.z.string().default('./logs'),
    LOG_MAX_SIZE: _zod.z.string().default('10m'),
    LOG_FREQUENCY: _zod.z.string().default('daily'),
    LOG_MAX_FILES: _zod.z.coerce.number().default(30),
    LOG_FILE_ENABLED: _zod.z.enum([
        'true',
        'false'
    ]).default('false').transform((v)=>v === 'true')
});
const logConfig = ()=>({
        log: logConfigSchema.parse({
            LOG_DIR: process.env.LOG_DIR,
            LOG_MAX_SIZE: process.env.LOG_MAX_SIZE,
            LOG_FREQUENCY: process.env.LOG_FREQUENCY,
            LOG_MAX_FILES: process.env.LOG_MAX_FILES,
            LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED
        })
    });

//# sourceMappingURL=log.config.js.map