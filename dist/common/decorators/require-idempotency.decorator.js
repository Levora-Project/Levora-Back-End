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
    get REQUIRE_IDEMPOTENCY_KEY () {
        return REQUIRE_IDEMPOTENCY_KEY;
    },
    get RequireIdempotency () {
        return RequireIdempotency;
    }
});
const _common = require("@nestjs/common");
const REQUIRE_IDEMPOTENCY_KEY = 'requireIdempotency';
const RequireIdempotency = ()=>(0, _common.SetMetadata)(REQUIRE_IDEMPOTENCY_KEY, true);

//# sourceMappingURL=require-idempotency.decorator.js.map