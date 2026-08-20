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
    get uploadConfig () {
        return uploadConfig;
    },
    get uploadConfigSchema () {
        return uploadConfigSchema;
    }
});
const _zod = require("zod");
const uploadConfigSchema = _zod.z.object({
    UPLOAD_DIR: _zod.z.string().default('./uploads'),
    UPLOAD_MAX_FILE_SIZE: _zod.z.coerce.number().default(10 * 1024 * 1024),
    UPLOAD_ALLOWED_MIMES: _zod.z.string().default('image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,application/json').transform((val)=>val.split(','))
});
const uploadConfig = ()=>({
        upload: uploadConfigSchema.parse({
            UPLOAD_DIR: process.env.UPLOAD_DIR,
            UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE,
            UPLOAD_ALLOWED_MIMES: process.env.UPLOAD_ALLOWED_MIMES
        })
    });

//# sourceMappingURL=upload.config.js.map