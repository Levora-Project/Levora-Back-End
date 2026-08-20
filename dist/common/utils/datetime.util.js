"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "toApiDatetime", {
    enumerable: true,
    get: function() {
        return toApiDatetime;
    }
});
function toApiDatetime(date) {
    return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

//# sourceMappingURL=datetime.util.js.map