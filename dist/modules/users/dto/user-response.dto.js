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
    get UserDataResponse () {
        return UserDataResponse;
    },
    get UserListResponseDto () {
        return UserListResponseDto;
    },
    get UserResponseDto () {
        return UserResponseDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _responsedto = require("../../../../dist/common/dto/response.dto.js");
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
let UserResponseDto = class UserResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '019cfb39-6252-72a6-b28e-9c65e3173f9c'
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
        example: true
    }),
    _ts_metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '2026-03-05T10:30:00+00:00'
    }),
    _ts_metadata("design:type", String)
], UserResponseDto.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '2026-03-05T10:30:00+00:00',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], UserResponseDto.prototype, "updatedAt", void 0);
let UserDataResponse = class UserDataResponse extends _responsedto.SuccessResponse {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: UserResponseDto
    }),
    _ts_metadata("design:type", typeof UserResponseDto === "undefined" ? Object : UserResponseDto)
], UserDataResponse.prototype, "data", void 0);
let UserListResponseDto = class UserListResponseDto extends _responsedto.PaginatedResponse {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: [
            UserResponseDto
        ]
    }),
    _ts_metadata("design:type", Array)
], UserListResponseDto.prototype, "data", void 0);

//# sourceMappingURL=user-response.dto.js.map