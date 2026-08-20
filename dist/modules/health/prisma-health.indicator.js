"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaHealthIndicator", {
    enumerable: true,
    get: function() {
        return PrismaHealthIndicator;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _prisma = require("../../../dist/prisma");
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
let PrismaHealthIndicator = class PrismaHealthIndicator extends _terminus.HealthIndicator {
    async isHealthy(key) {
        const isHealthy = await this.prisma.isHealthy();
        const result = this.getStatus(key, isHealthy);
        if (isHealthy) {
            return result;
        }
        throw new _terminus.HealthCheckError('Database check failed', result);
    }
    constructor(prisma){
        super(), this.prisma = prisma;
    }
};
PrismaHealthIndicator = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prisma.PrismaService === "undefined" ? Object : _prisma.PrismaService
    ])
], PrismaHealthIndicator);

//# sourceMappingURL=prisma-health.indicator.js.map