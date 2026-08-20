"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AllExceptionsFilter", {
    enumerable: true,
    get: function() {
        return AllExceptionsFilter;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _responsedto = require("../../../dist/common/dto/response.dto");
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
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.headers['x-request-id'];
        const startTime = request.startTime;
        const duration = startTime ? Date.now() - startTime : 0;
        const status = exception instanceof _common.HttpException ? exception.getStatus() : _common.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof _common.HttpException ? exception.getResponse() : null;
        let message = 'An unexpected error occurred';
        let errors = [];
        let code = _responsedto.STATUS_TO_ERROR_CODE[status] ?? _responsedto.ErrorCode.SYSTEM_INTERNAL_ERROR;
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
            errors = [
                {
                    code,
                    message
                }
            ];
        } else if (exceptionResponse && typeof exceptionResponse === 'object') {
            const res = exceptionResponse;
            if (res.code) {
                code = res.code;
            }
            message = res.message || message;
            // Structured errors array from exceptionFactory or custom exception
            if (Array.isArray(res.errors)) {
                errors = res.errors;
            } else if (Array.isArray(res.message)) {
                // Fallback: plain string[] from default ValidationPipe (no exceptionFactory)
                code = _responsedto.ErrorCode.VALIDATION_REQUIRED;
                message = 'Validation failed';
                errors = res.message.map((msg)=>({
                        code,
                        message: msg
                    }));
            } else {
                errors = [
                    {
                        code,
                        message
                    }
                ];
            }
        } else {
            errors = [
                {
                    code,
                    message
                }
            ];
        }
        if (requestId) {
            response.setHeader('X-Request-ID', requestId);
        }
        response.setHeader('X-Response-Time', `${duration}ms`);
        if (status === 401) {
            response.setHeader('WWW-Authenticate', 'Bearer realm="api"');
        }
        if (status === 429) {
            let retryAfterSeconds = 60;
            if (exception instanceof _throttler.ThrottlerException) {
                const throttlerResponse = exception.getResponse();
                if (typeof throttlerResponse.retryAfter === 'number') {
                    retryAfterSeconds = Math.ceil(throttlerResponse.retryAfter / 1000);
                }
            }
            response.setHeader('Retry-After', String(retryAfterSeconds));
        }
        const errorBody = {
            success: false,
            status,
            message,
            data: null,
            meta: null,
            errors,
            timestamp: (0, _datetimeutil.toApiDatetime)(new Date())
        };
        const logContext = {
            statusCode: status,
            errorCode: code,
            method: request.method,
            url: request.url,
            requestId,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            userId: request.user?.id
        };
        if (status >= 500) {
            this.logger.error({
                ...logContext,
                err: exception instanceof Error ? {
                    message: exception.message,
                    stack: exception.stack,
                    name: exception.name
                } : {
                    message: String(exception)
                }
            }, `${request.method} ${request.url} ${status}`);
        } else if (status >= 400) {
            this.logger.warn(logContext, `${request.method} ${request.url} ${status} – ${code}`);
        }
        response.status(status).json(errorBody);
    }
    constructor(){
        this.logger = new _common.Logger(AllExceptionsFilter.name);
    }
};
AllExceptionsFilter = _ts_decorate([
    (0, _common.Catch)()
], AllExceptionsFilter);

//# sourceMappingURL=all-exceptions.filter.js.map