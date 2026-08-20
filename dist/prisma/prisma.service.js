"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaService", {
    enumerable: true,
    get: function() {
        return PrismaService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
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
let PrismaService = class PrismaService extends _client.PrismaClient {
    async onModuleInit() {
        this.logger.log('Connecting to database...');
        await this.$connect();
        this.logger.log('Database connected');
    }
    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    /**
   * Health check – used by TerminusModule
   */ async isHealthy() {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch  {
            return false;
        }
    }
    constructor(){
        let url = process.env.DATABASE_URL;
        if (url && (url.includes(':6543') || url.includes('pooler.supabase.com')) && !url.includes('pgbouncer=true')) {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}pgbouncer=true`;
        }
        super({
            datasources: url ? {
                db: {
                    url
                }
            } : undefined,
            log: process.env.NODE_ENV === 'development' ? [
                'query',
                'info',
                'warn',
                'error'
            ] : [
                'error'
            ]
        }), this.logger = new _common.Logger(PrismaService.name);
    }
};
PrismaService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], PrismaService);

//# sourceMappingURL=prisma.service.js.map