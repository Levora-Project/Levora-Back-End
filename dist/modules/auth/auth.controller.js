"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _swagger = require("@nestjs/swagger");
const _config = require("@nestjs/config");
const _express = require("express");
const _authservice = require("./auth.service");
const _dto = require("./dto");
const _decorators = require("../../../dist/common/decorators");
const _dto1 = require("../../../dist/common/dto");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';
let AuthController = class AuthController {
    setTokenCookies(res, tokens) {
        const isSecure = this.config.get('security.COOKIE_SECURE', false);
        const domain = this.config.get('security.COOKIE_DOMAIN');
        const baseOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
            ...domain ? {
                domain
            } : {}
        };
        res.cookie(ACCESS_COOKIE, tokens.accessToken, {
            ...baseOptions,
            path: '/',
            maxAge: 15 * 60 * 1000
        });
        res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
            ...baseOptions,
            path: '/api/v1/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }
    clearTokenCookies(res) {
        const domain = this.config.get('security.COOKIE_DOMAIN');
        const opts = {
            httpOnly: true,
            ...domain ? {
                domain
            } : {}
        };
        res.clearCookie(ACCESS_COOKIE, {
            ...opts,
            path: '/'
        });
        res.clearCookie(REFRESH_COOKIE, {
            ...opts,
            path: '/api/v1/auth/refresh'
        });
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        this.setTokenCookies(res, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
        return result;
    }
    async refresh(dto, req, res) {
        const token = dto?.refreshToken || req.cookies?.[REFRESH_COOKIE];
        if (!token) {
            throw new _common.UnauthorizedException('Refresh token is required');
        }
        const result = await this.authService.refreshToken(token);
        this.setTokenCookies(res, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
        return result;
    }
    logout(res) {
        this.clearTokenCookies(res);
    }
    getProfile(userId) {
        return this.authService.getMe(userId);
    }
    constructor(authService, config){
        this.authService = authService;
        this.config = config;
    }
};
_ts_decorate([
    (0, _decorators.Public)(),
    (0, _throttler.Throttle)({
        default: {
            ttl: 60000,
            limit: 10
        }
    }),
    (0, _common.Post)('register'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    (0, _swagger.ApiOperation)({
        summary: 'Register new user and create profile'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'User registered successfully',
        type: _dto.UserResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid input data or weak password',
        type: _dto1.ErrorResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 409,
        description: 'Email already registered',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.RegisterDto === "undefined" ? Object : _dto.RegisterDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
_ts_decorate([
    (0, _decorators.Public)(),
    (0, _throttler.Throttle)({
        default: {
            ttl: 60000,
            limit: 10
        }
    }),
    (0, _common.Post)('login'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Login with email and password'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Login successful, returns access and refresh tokens',
        type: _dto.LoginResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Invalid credentials',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.LoginDto === "undefined" ? Object : _dto.LoginDto,
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _decorators.Public)(),
    (0, _throttler.Throttle)({
        default: {
            ttl: 60000,
            limit: 10
        }
    }),
    (0, _common.Post)('refresh'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Refresh access token'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Tokens refreshed successfully',
        type: _dto.RefreshTokenResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Invalid or expired refresh token',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_param(2, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.RefreshTokenDto === "undefined" ? Object : _dto.RefreshTokenDto,
        typeof _express.Request === "undefined" ? Object : _express.Request,
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
_ts_decorate([
    (0, _common.Post)('logout'),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Logout (clear cookies)'
    }),
    (0, _swagger.ApiResponse)({
        status: 204,
        description: 'Logged out'
    }),
    _ts_param(0, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
_ts_decorate([
    (0, _common.Get)('me'),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get current user profile'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Current user profile retrieved successfully',
        type: _dto.UserResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Unauthorized access',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _decorators.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], AuthController.prototype, "getProfile", null);
AuthController = _ts_decorate([
    (0, _swagger.ApiTags)('Auth'),
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map