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
    get AuthMessageResponseDto () {
        return AuthMessageResponseDto;
    },
    get AuthTokensDto () {
        return AuthTokensDto;
    },
    get LoginResponseDto () {
        return LoginResponseDto;
    },
    get RefreshTokenResponseDto () {
        return RefreshTokenResponseDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _userresponsedto = require("./user-response.dto");
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
let AuthTokensDto = class AuthTokensDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    _ts_metadata("design:type", String)
], AuthTokensDto.prototype, "accessToken", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    _ts_metadata("design:type", String)
], AuthTokensDto.prototype, "refreshToken", void 0);
let LoginResponseDto = class LoginResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    _ts_metadata("design:type", String)
], LoginResponseDto.prototype, "accessToken", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    _ts_metadata("design:type", String)
], LoginResponseDto.prototype, "refreshToken", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: _userresponsedto.UserResponseDto
    }),
    _ts_metadata("design:type", typeof _userresponsedto.UserResponseDto === "undefined" ? Object : _userresponsedto.UserResponseDto)
], LoginResponseDto.prototype, "user", void 0);
let RefreshTokenResponseDto = class RefreshTokenResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    _ts_metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "accessToken", void 0);
let AuthMessageResponseDto = class AuthMessageResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Operation successful'
    }),
    _ts_metadata("design:type", String)
], AuthMessageResponseDto.prototype, "message", void 0);

//# sourceMappingURL=auth-response.dto.js.map