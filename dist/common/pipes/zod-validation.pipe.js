"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ZodValidationPipe", {
    enumerable: true,
    get: function() {
        return ZodValidationPipe;
    }
});
const _common = require("@nestjs/common");
const _zod = require("zod");
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
let ZodValidationPipe = class ZodValidationPipe {
    transform(value, _metadata) {
        try {
            return this.schema.parse(value);
        } catch (error) {
            if (error instanceof _zod.ZodError) {
                throw new _common.BadRequestException({
                    message: 'Validation failed',
                    errors: error.errors.map((e)=>({
                            field: e.path.join('.'),
                            message: e.message
                        }))
                });
            }
            throw new _common.BadRequestException('Validation failed');
        }
    }
    constructor(schema){
        this.schema = schema;
    }
};
ZodValidationPipe = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _zod.ZodSchema === "undefined" ? Object : _zod.ZodSchema
    ])
], ZodValidationPipe);

//# sourceMappingURL=zod-validation.pipe.js.map