"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IdempotencyGuard", {
    enumerable: true,
    get: function() {
        return IdempotencyGuard;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _dto = require("../../../dist/common/dto");
const _decorators = require("../../../dist/common/decorators");
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
let IdempotencyGuard = class IdempotencyGuard {
    canActivate(context) {
        const requiresIdempotency = this.reflector.getAllAndOverride(_decorators.REQUIRE_IDEMPOTENCY_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiresIdempotency) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const idempotencyKey = request.headers['idempotency-key'];
        if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0) {
            throw new _common.UnprocessableEntityException({
                message: 'Validation failed',
                errors: [
                    {
                        field: 'idempotency-key',
                        code: _dto.ErrorCode.VALIDATION_REQUIRED,
                        message: 'Idempotency-Key header is required'
                    }
                ]
            });
        }
        return true;
    }
    constructor(reflector){
        this.reflector = reflector;
    }
};
IdempotencyGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector
    ])
], IdempotencyGuard);

//# sourceMappingURL=idempotency.guard.js.map