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
    get databaseConfig () {
        return databaseConfig;
    },
    get databaseConfigSchema () {
        return databaseConfigSchema;
    }
});
const _zod = require("zod");
const databaseConfigSchema = _zod.z.object({
    DATABASE_URL: _zod.z.string().url()
});
function formatDatabaseUrl(url) {
    if (!url) {
        return url;
    }
    if ((url.includes(':6543') || url.includes('pooler.supabase.com')) && !url.includes('pgbouncer=true')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}pgbouncer=true`;
    }
    return url;
}
const databaseConfig = ()=>({
        database: databaseConfigSchema.parse({
            DATABASE_URL: formatDatabaseUrl(process.env.DATABASE_URL)
        })
    });

//# sourceMappingURL=database.config.js.map