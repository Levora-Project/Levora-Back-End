"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _config = require("@nestjs/config");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
const _nestjspino = require("nestjs-pino");
const _usersservice = require("../../../dist/modules/users/users.service");
const _repositories = require("../../../dist/modules/users/repositories");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
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
let AuthService = class AuthService {
    // ── Register ─────────────────────────────────
    async register(dto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            this.logger.warn(`Registration failed: email ${dto.email} already exists`);
            throw new _common.ConflictException('Email already registered');
        }
        const hashedPassword = await _bcryptjs.hash(dto.password, 12);
        const user = await this.usersService.createUser({
            email: dto.email,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName
        });
        this.logger.info(`User registered successfully: ${user.email}`);
        return this.formatUserResponse(user);
    }
    // ── Login ────────────────────────────────────
    async login(dto) {
        const user = await this.usersRepo.findUniqueRaw({
            where: {
                email: dto.email
            },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                isEmailVerified: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                userProfile: {
                    select: {
                        fullName: true,
                        completionPct: true,
                        isDraft: true
                    }
                }
            }
        });
        if (!user || !user.isActive) {
            this.logger.warn(`Failed login attempt: ${dto.email} (user not found or inactive)`);
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            this.logger.warn(`Failed login attempt: ${dto.email} (SSO-only account, no password)`);
            throw new _common.UnauthorizedException('This account uses SSO login. Please sign in with your provider.');
        }
        const passwordValid = await _bcryptjs.compare(dto.password, user.password);
        if (!passwordValid) {
            this.logger.warn(`Failed login attempt: ${dto.email} (wrong password)`);
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        await this.usersService.updateLastLogin(user.id);
        const role = await this.userRolesRepo.getCurrentRoleName(user.id);
        const tokens = await this.generateTokens(user.id, user.email, role);
        const userOutput = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLoginAt: new Date(),
            createdAt: user.createdAt,
            userProfile: user.userProfile,
            roles: [
                role
            ]
        };
        this.logger.info(`User logged in: ${user.email}`);
        return {
            ...tokens,
            user: userOutput
        };
    }
    // ── Refresh Token ────────────────────────────
    async refreshToken(dto) {
        const token = typeof dto === 'string' ? dto : dto.refreshToken;
        try {
            const payload = await this.jwt.verifyAsync(token);
            const user = await this.usersService.findById(payload.sub);
            if (!user || !user.isActive) {
                throw new _common.UnauthorizedException('Account is deactivated');
            }
            const role = await this.userRolesRepo.getCurrentRoleName(user.id);
            const tokens = await this.generateTokens(user.id, user.email, role);
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            };
        } catch  {
            throw new _common.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    // Alias for backward compatibility
    async refresh(token) {
        return this.refreshToken(token);
    }
    // ── Validate JWT payload (used by guard) ──────
    async validateUser(payload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new _common.UnauthorizedException('User not found or deactivated');
        }
        const role = await this.userRolesRepo.getCurrentRoleName(user.id);
        return {
            ...user,
            role
        };
    }
    // ── Get Profile (GET /auth/me) ────────────────
    async getProfile(userId) {
        const user = await this.usersService.getUserWithProfile(userId);
        return this.formatUserResponse(user);
    }
    async getMe(userId) {
        return this.getProfile(userId);
    }
    // ── Helpers ──────────────────────────────────
    formatUserResponse(user) {
        let roles = [
            'user'
        ];
        if (Array.isArray(user.userRoles)) {
            roles = user.userRoles.map((ur)=>ur?.roles?.name ?? 'user');
        } else if (Array.isArray(user.roles)) {
            roles = user.roles;
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName ?? null,
            lastName: user.lastName ?? null,
            isEmailVerified: user.isEmailVerified ?? false,
            isActive: user.isActive ?? true,
            lastLoginAt: user.lastLoginAt ?? null,
            createdAt: user.createdAt,
            userProfile: user.userProfile ?? null,
            roles
        };
    }
    async generateTokens(userId, email, role) {
        const payload = {
            sub: userId,
            email,
            role
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                expiresIn: this.config.get('security.JWT_ACCESS_EXPIRES', '15m')
            }),
            this.jwt.signAsync(payload, {
                expiresIn: this.config.get('security.JWT_REFRESH_EXPIRES', '7d')
            })
        ]);
        return {
            accessToken,
            refreshToken
        };
    }
    constructor(logger, usersService, usersRepo, userRolesRepo, jwt, config){
        this.logger = logger;
        this.usersService = usersService;
        this.usersRepo = usersRepo;
        this.userRolesRepo = userRolesRepo;
        this.jwt = jwt;
        this.config = config;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _nestjspino.InjectPinoLogger)(AuthService.name)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger,
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService,
        typeof _repositories.UsersRepository === "undefined" ? Object : _repositories.UsersRepository,
        typeof _repositories.UserRolesRepository === "undefined" ? Object : _repositories.UserRolesRepository,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map