"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TransformInterceptor", {
    enumerable: true,
    get: function() {
        return TransformInterceptor;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _rxjs = require("rxjs");
const _deprecateddecorator = require("../../../dist/common/decorators/deprecated.decorator.js");
const _responsemessagedecorator = require("../../../dist/common/decorators/response-message.decorator.js");
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
function isPaginated(value) {
    return value !== null && typeof value === 'object' && 'data' in value && 'total' in value && 'page' in value && 'hasNext' in value;
}
function getAutoMessage(method, statusCode) {
    if (statusCode === 201) {
        return 'Created successfully';
    }
    if (method === 'PATCH' || method === 'PUT') {
        return 'Updated successfully';
    }
    return 'OK';
}
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const startTime = Date.now();
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();
        const serverGeneratedId = request.generatedRequestId === true;
        const requestId = request.headers['x-request-id'];
        const customMessage = this.reflector.getAllAndOverride(_responsemessagedecorator.RESPONSE_MESSAGE_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        const deprecatedOptions = this.reflector.getAllAndOverride(_deprecateddecorator.DEPRECATED_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        return next.handle().pipe((0, _rxjs.map)((responseData)=>{
            const statusCode = response.statusCode;
            const duration = Date.now() - startTime;
            if (requestId) {
                response.setHeader('X-Request-ID', requestId);
            }
            response.setHeader('X-Response-Time', `${duration}ms`);
            const deprecationMeta = deprecatedOptions ? {
                message: 'This endpoint is deprecated and will be removed in a future version.',
                sunsetDate: new Date(deprecatedOptions.sunsetDate).toISOString(),
                replacement: deprecatedOptions.replacement
            } : undefined;
            if (deprecatedOptions) {
                response.setHeader('Deprecation', 'true');
                response.setHeader('Sunset', new Date(deprecatedOptions.sunsetDate).toUTCString());
                response.setHeader('Link', `<${deprecatedOptions.replacement}>; rel="successor-version"`);
            }
            const requestIdMeta = serverGeneratedId && requestId ? {
                requestId
            } : undefined;
            const timestamp = (0, _datetimeutil.toApiDatetime)(new Date());
            const message = customMessage || getAutoMessage(request.method, statusCode);
            if (isPaginated(responseData)) {
                const { data, total, page, limit, totalPages, hasNext, hasPrev } = responseData;
                return {
                    success: true,
                    status: statusCode,
                    message,
                    data,
                    meta: {
                        pagination: {
                            page,
                            limit,
                            total,
                            totalPages,
                            hasNext,
                            hasPrev
                        },
                        ...requestIdMeta,
                        ...deprecationMeta ? {
                            deprecation: deprecationMeta
                        } : {}
                    },
                    errors: null,
                    timestamp
                };
            }
            return {
                success: true,
                status: statusCode,
                message,
                data: responseData,
                meta: requestIdMeta || deprecationMeta ? {
                    ...requestIdMeta,
                    ...deprecationMeta ? {
                        deprecation: deprecationMeta
                    } : {}
                } : null,
                errors: null,
                timestamp
            };
        }));
    }
    constructor(reflector){
        this.reflector = reflector;
    }
};
TransformInterceptor = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector
    ])
], TransformInterceptor);

//# sourceMappingURL=transform.interceptor.js.map