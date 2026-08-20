"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _passport = require("@nestjs/passport");
const _config = require("@nestjs/config");
const _authservice = require("./auth.service");
const _authcontroller = require("./auth.controller");
const _jwtstrategy = require("./strategies/jwt.strategy");
const _jwtauthguard = require("./guards/jwt-auth.guard");
const _usersmodule = require("../../../dist/modules/users/users.module");
const _repositories = require("../../../dist/modules/users/repositories");
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
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _passport.PassportModule.register({
                defaultStrategy: 'jwt'
            }),
            _jwt.JwtModule.registerAsync({
                global: true,
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>({
                        secret: config.get('security.JWT_SECRET') || config.get('JWT_SECRET') || 'dev-only-secret-do-not-use-in-production!!',
                        signOptions: {
                            expiresIn: config.get('security.JWT_ACCESS_EXPIRES', '15m')
                        }
                    })
            }),
            _usersmodule.UsersModule
        ],
        controllers: [
            _authcontroller.AuthController
        ],
        providers: [
            _authservice.AuthService,
            _jwtstrategy.JwtStrategy,
            _jwtauthguard.JwtAuthGuard,
            _repositories.UsersRepository,
            _repositories.UserRolesRepository
        ],
        exports: [
            _authservice.AuthService,
            _jwtstrategy.JwtStrategy,
            _jwtauthguard.JwtAuthGuard
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map