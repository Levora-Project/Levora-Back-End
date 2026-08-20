"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HealthController", {
    enumerable: true,
    get: function() {
        return HealthController;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _swagger = require("@nestjs/swagger");
const _prismahealthindicator = require("./prisma-health.indicator");
const _redishealthindicator = require("./redis-health.indicator");
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
let HealthController = class HealthController {
    check() {
        return this.health.check([
            ()=>this.prismaHealth.isHealthy('database'),
            ()=>this.redisHealth.isHealthy('redis')
        ]);
    }
    ready() {
        return this.health.check([
            ()=>this.prismaHealth.isHealthy('database'),
            ()=>this.redisHealth.isHealthy('redis')
        ]);
    }
    constructor(health, prismaHealth, redisHealth){
        this.health = health;
        this.prismaHealth = prismaHealth;
        this.redisHealth = redisHealth;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _terminus.HealthCheck)(),
    (0, _swagger.ApiOperation)({
        summary: 'Liveness probe'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], HealthController.prototype, "check", null);
_ts_decorate([
    (0, _common.Get)('ready'),
    (0, _terminus.HealthCheck)(),
    (0, _swagger.ApiOperation)({
        summary: 'Readiness probe'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], HealthController.prototype, "ready", null);
HealthController = _ts_decorate([
    (0, _swagger.ApiTags)('Health'),
    (0, _decorators.Public)(),
    (0, _common.Controller)('health'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _terminus.HealthCheckService === "undefined" ? Object : _terminus.HealthCheckService,
        typeof _prismahealthindicator.PrismaHealthIndicator === "undefined" ? Object : _prismahealthindicator.PrismaHealthIndicator,
        typeof _redishealthindicator.RedisHealthIndicator === "undefined" ? Object : _redishealthindicator.RedisHealthIndicator
    ])
], HealthController);

//# sourceMappingURL=health.controller.js.map