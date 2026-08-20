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
    get DEPRECATED_KEY () {
        return DEPRECATED_KEY;
    },
    get Deprecated () {
        return Deprecated;
    }
});
const _common = require("@nestjs/common");
const DEPRECATED_KEY = 'deprecated';
const Deprecated = (options)=>(0, _common.SetMetadata)(DEPRECATED_KEY, options);

//# sourceMappingURL=deprecated.decorator.js.map