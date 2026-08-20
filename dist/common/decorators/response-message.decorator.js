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
    get RESPONSE_MESSAGE_KEY () {
        return RESPONSE_MESSAGE_KEY;
    },
    get ResponseMessage () {
        return ResponseMessage;
    }
});
const _common = require("@nestjs/common");
const RESPONSE_MESSAGE_KEY = 'response_message';
const ResponseMessage = (message)=>(0, _common.SetMetadata)(RESPONSE_MESSAGE_KEY, message);

//# sourceMappingURL=response-message.decorator.js.map