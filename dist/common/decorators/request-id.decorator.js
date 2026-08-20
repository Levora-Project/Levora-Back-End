"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RequestId", {
    enumerable: true,
    get: function() {
        return RequestId;
    }
});
const _common = require("@nestjs/common");
const RequestId = (0, _common.createParamDecorator)((_data, ctx)=>{
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-request-id'] || 'unknown';
});

//# sourceMappingURL=request-id.decorator.js.map