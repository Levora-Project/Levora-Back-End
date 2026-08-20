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
    get UserProfileDto () {
        return UserProfileDto;
    },
    get UserResponseDto () {
        return UserResponseDto;
    }
});
const _swagger = require("@nestjs/swagger");
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
let UserProfileDto = class UserProfileDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'John Doe'
    }),
    _ts_metadata("design:type", Object)
], UserProfileDto.prototype, "fullName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: true
    }),
    _ts_metadata("design:type", Boolean)
], UserProfileDto.prototype, "isDraft", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 0
    }),
    _ts_metadata("design:type", Number)
], UserProfileDto.prototype, "completionPct", void 0);
let UserResponseDto = class UserResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '9dd10e8f-0f3c-4295-befb-6109efd2587f'
    }),
    _ts_metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'user@example.com'
    }),
    _ts_metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'John'
    }),
    _ts_metadata("design:type", Object)
], UserResponseDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Doe'
    }),
    _ts_metadata("design:type", Object)
], UserResponseDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: false
    }),
    _ts_metadata("design:type", Boolean)
], UserResponseDto.prototype, "isEmailVerified", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: true
    }),
    _ts_metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '2026-08-19T10:00:00.000Z'
    }),
    _ts_metadata("design:type", Object)
], UserResponseDto.prototype, "lastLoginAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '2026-08-19T10:00:00.000Z'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], UserResponseDto.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: UserProfileDto
    }),
    _ts_metadata("design:type", Object)
], UserResponseDto.prototype, "userProfile", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'user'
        ]
    }),
    _ts_metadata("design:type", Array)
], UserResponseDto.prototype, "roles", void 0);

//# sourceMappingURL=user-response.dto.js.map