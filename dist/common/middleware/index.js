"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get IdempotencyMiddleware () {
        return _idempotencymiddleware.IdempotencyMiddleware;
    },
    get RequestIdMiddleware () {
        return _requestidmiddleware.RequestIdMiddleware;
    }
});
const _requestidmiddleware = require("./request-id.middleware");
const _idempotencymiddleware = require("./idempotency.middleware");

//# sourceMappingURL=index.js.map