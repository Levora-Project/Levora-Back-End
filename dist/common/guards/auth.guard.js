"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthGuard", {
    enumerable: true,
    get: function() {
        return AuthGuard;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _jwt = require("@nestjs/jwt");
const _decorators = require("../../../dist/common/decorators");
const _auth = require("../../../dist/modules/auth");
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
let AuthGuard = class AuthGuard {
    async canActivate(context) {
        // 1. Check @Public()
        const isPublic = this.reflector.getAllAndOverride(_decorators.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        // 2. Try JWT from httpOnly cookie (browser / frontend)
        const cookies = request.cookies;
        const cookieToken = cookies?.['accessToken'];
        if (cookieToken) {
            return this.validateJwt(request, cookieToken);
        }
        // 3. Try JWT Bearer header (mobile / Swagger)
        const headers = request.headers;
        const authHeader = headers['authorization'];
        if (authHeader?.startsWith('Bearer ')) {
            return this.validateJwt(request, authHeader.slice(7));
        }
        throw new _common.UnauthorizedException('Missing authentication: provide a cookie or Bearer token');
    }
    async validateJwt(request, token) {
        try {
            const payload = await this.jwt.verifyAsync(token);
            request.user = await this.authService.validateUser(payload);
            return true;
        } catch  {
            throw new _common.UnauthorizedException('Invalid or expired access token');
        }
    }
    constructor(reflector, jwt, authService){
        this.reflector = reflector;
        this.jwt = jwt;
        this.authService = authService;
    }
};
AuthGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _auth.AuthService === "undefined" ? Object : _auth.AuthService
    ])
], AuthGuard);

//# sourceMappingURL=auth.guard.js.map