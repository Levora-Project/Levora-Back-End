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
    get CurrentUser () {
        return _currentuserdecorator.CurrentUser;
    },
    get DEPRECATED_KEY () {
        return _deprecateddecorator.DEPRECATED_KEY;
    },
    get Deprecated () {
        return _deprecateddecorator.Deprecated;
    },
    get DeprecatedOptions () {
        return _deprecateddecorator.DeprecatedOptions;
    },
    get IS_PUBLIC_KEY () {
        return _publicdecorator.IS_PUBLIC_KEY;
    },
    get Public () {
        return _publicdecorator.Public;
    },
    get REQUIRE_IDEMPOTENCY_KEY () {
        return _requireidempotencydecorator.REQUIRE_IDEMPOTENCY_KEY;
    },
    get RESPONSE_MESSAGE_KEY () {
        return _responsemessagedecorator.RESPONSE_MESSAGE_KEY;
    },
    get ROLES_KEY () {
        return _rolesdecorator.ROLES_KEY;
    },
    get RequestId () {
        return _requestiddecorator.RequestId;
    },
    get RequireIdempotency () {
        return _requireidempotencydecorator.RequireIdempotency;
    },
    get ResponseMessage () {
        return _responsemessagedecorator.ResponseMessage;
    },
    get Roles () {
        return _rolesdecorator.Roles;
    }
});
const _requestiddecorator = require("./request-id.decorator");
const _publicdecorator = require("./public.decorator");
const _currentuserdecorator = require("./current-user.decorator");
const _rolesdecorator = require("./roles.decorator");
const _responsemessagedecorator = require("./response-message.decorator");
const _requireidempotencydecorator = require("./require-idempotency.decorator");
const _deprecateddecorator = require("./deprecated.decorator");

//# sourceMappingURL=index.js.map