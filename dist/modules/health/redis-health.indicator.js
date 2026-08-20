"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedisHealthIndicator", {
    enumerable: true,
    get: function() {
        return RedisHealthIndicator;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _redis = require("../../../dist/redis");
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
let RedisHealthIndicator = class RedisHealthIndicator extends _terminus.HealthIndicator {
    async isHealthy(key) {
        const isHealthy = await this.redis.isHealthy();
        const result = this.getStatus(key, isHealthy);
        if (isHealthy) {
            return result;
        }
        throw new _terminus.HealthCheckError('Redis check failed', result);
    }
    constructor(redis){
        super(), this.redis = redis;
    }
};
RedisHealthIndicator = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _redis.RedisService === "undefined" ? Object : _redis.RedisService
    ])
], RedisHealthIndicator);

//# sourceMappingURL=redis-health.indicator.js.map