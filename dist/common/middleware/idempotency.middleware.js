"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IdempotencyMiddleware", {
    enumerable: true,
    get: function() {
        return IdempotencyMiddleware;
    }
});
const _common = require("@nestjs/common");
const _cachemanager = require("@nestjs/cache-manager");
const _cachemanager1 = require("cache-manager");
const _crypto = require("crypto");
const _dto = require("../../../dist/common/dto");
const _datetimeutil = require("../../../dist/common/utils/datetime.util");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const IDEMPOTENCY_TTL_MS = 86_400_000;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let IdempotencyMiddleware = class IdempotencyMiddleware {
    async use(req, res, next) {
        if (req.method !== 'POST' && req.method !== 'PATCH') {
            next();
            return;
        }
        const idempotencyKey = req.header('Idempotency-Key');
        if (!idempotencyKey) {
            next();
            return;
        }
        if (!UUID_V4_REGEX.test(idempotencyKey)) {
            this.sendError(req, res, 422, 'Validation failed', _dto.ErrorCode.VALIDATION_INVALID_FORMAT, 'Idempotency-Key must be a valid UUID v4', 'idempotency-key');
            return;
        }
        const requestHash = (0, _crypto.createHash)('sha256').update(`${req.method}:${req.path}:${JSON.stringify(req.body ?? {})}`).digest('hex');
        const cacheKey = `idempotency:${idempotencyKey}`;
        try {
            const existingRecord = await this.cache.get(cacheKey);
            if (existingRecord) {
                if (existingRecord.requestHash !== requestHash) {
                    this.sendError(req, res, 422, 'Idempotency key conflict', _dto.ErrorCode.SYSTEM_IDEMPOTENCY_KEY_CONFLICT, 'Idempotency-Key was already used with a different request payload');
                    return;
                }
                if (existingRecord.status === 'processing') {
                    this.sendError(req, res, 409, 'Request already in progress', _dto.ErrorCode.SYSTEM_REQUEST_IN_PROGRESS, 'A request with this Idempotency-Key is still processing');
                    return;
                }
                if (existingRecord.status === 'completed' && typeof existingRecord.responseBody === 'string') {
                    res.setHeader('Idempotent-Replayed', 'true');
                    let parsedBody = existingRecord.responseBody;
                    try {
                        parsedBody = JSON.parse(existingRecord.responseBody);
                    } catch  {
                    // Keep raw string when cached payload is not valid JSON.
                    }
                    res.status(existingRecord.statusCode ?? 200).json(parsedBody);
                    return;
                }
            }
            const now = Date.now();
            const processingRecord = {
                key: idempotencyKey,
                requestHash,
                status: 'processing',
                createdAt: now,
                expiresAt: now + IDEMPOTENCY_TTL_MS
            };
            await this.cache.set(cacheKey, processingRecord, IDEMPOTENCY_TTL_MS);
            const originalJson = res.json.bind(res);
            res.json = (body)=>{
                const completedRecord = {
                    ...processingRecord,
                    status: 'completed',
                    statusCode: res.statusCode,
                    responseBody: JSON.stringify(body)
                };
                void this.cache.set(cacheKey, completedRecord, IDEMPOTENCY_TTL_MS).catch((error)=>{
                    this.logger.error({
                        error,
                        idempotencyKey,
                        path: req.path,
                        method: req.method
                    }, 'Failed to persist completed idempotency record');
                });
                return originalJson(body);
            };
        } catch (error) {
            this.logger.error({
                error,
                idempotencyKey,
                path: req.path,
                method: req.method
            }, 'Idempotency cache unavailable, continuing without idempotency enforcement');
        }
        next();
    }
    sendError(req, res, status, message, code, detail, field) {
        const requestId = req.headers['x-request-id'];
        if (typeof requestId === 'string' && requestId.length > 0) {
            res.setHeader('X-Request-ID', requestId);
        }
        res.status(status).json({
            success: false,
            status,
            message,
            data: null,
            meta: null,
            errors: [
                {
                    ...field ? {
                        field
                    } : {},
                    code,
                    message: detail
                }
            ],
            timestamp: (0, _datetimeutil.toApiDatetime)(new Date())
        });
    }
    constructor(cache){
        this.cache = cache;
        this.logger = new _common.Logger(IdempotencyMiddleware.name);
    }
};
IdempotencyMiddleware = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_cachemanager.CACHE_MANAGER)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cachemanager1.Cache === "undefined" ? Object : _cachemanager1.Cache
    ])
], IdempotencyMiddleware);

//# sourceMappingURL=idempotency.middleware.js.map