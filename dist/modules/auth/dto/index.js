"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./login.dto"), exports);
_export_star(require("./register.dto"), exports);
_export_star(require("./refresh-token.dto"), exports);
_export_star(require("./user-response.dto"), exports);
_export_star(require("./auth-response.dto"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map