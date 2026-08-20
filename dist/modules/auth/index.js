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
    get AuthModule () {
        return _authmodule.AuthModule;
    },
    get AuthService () {
        return _authservice.AuthService;
    },
    get AuthTokens () {
        return _authservice.AuthTokens;
    },
    get JwtAuthGuard () {
        return _jwtauthguard.JwtAuthGuard;
    },
    get JwtPayload () {
        return _authservice.JwtPayload;
    },
    get JwtStrategy () {
        return _jwtstrategy.JwtStrategy;
    }
});
const _authmodule = require("./auth.module");
const _authservice = require("./auth.service");
const _jwtauthguard = require("./guards/jwt-auth.guard");
const _jwtstrategy = require("./strategies/jwt.strategy");

//# sourceMappingURL=index.js.map