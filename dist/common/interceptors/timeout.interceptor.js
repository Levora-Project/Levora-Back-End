"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TimeoutInterceptor", {
    enumerable: true,
    get: function() {
        return TimeoutInterceptor;
    }
});
const _common = require("@nestjs/common");
const _rxjs = require("rxjs");
const _operators = require("rxjs/operators");
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
let TimeoutInterceptor = class TimeoutInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, _operators.timeout)(this.timeoutMs), (0, _operators.catchError)((err)=>{
            if (err instanceof _rxjs.TimeoutError) {
                return (0, _rxjs.throwError)(()=>new _common.RequestTimeoutException());
            }
            return (0, _rxjs.throwError)(()=>err);
        }));
    }
    constructor(timeoutMs = 30_000){
        this.timeoutMs = timeoutMs;
    }
};
TimeoutInterceptor = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ])
], TimeoutInterceptor);

//# sourceMappingURL=timeout.interceptor.js.map