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
    get ApiErrorItem () {
        return ApiErrorItem;
    },
    get ErrorCode () {
        return ErrorCode;
    },
    get ErrorResponse () {
        return ErrorResponse;
    },
    get MetaWithPagination () {
        return MetaWithPagination;
    },
    get PaginatedResponse () {
        return PaginatedResponse;
    },
    get PaginationMeta () {
        return PaginationMeta;
    },
    get STATUS_TO_ERROR_CODE () {
        return STATUS_TO_ERROR_CODE;
    },
    get SuccessResponse () {
        return SuccessResponse;
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
let ApiErrorItem = class ApiErrorItem {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'email',
        description: 'Field that caused the error'
    }),
    _ts_metadata("design:type", String)
], ApiErrorItem.prototype, "field", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'USER_EMAIL_DUPLICATE',
        description: 'SCREAMING_SNAKE_CASE error code'
    }),
    _ts_metadata("design:type", String)
], ApiErrorItem.prototype, "code", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'This email is already registered'
    }),
    _ts_metadata("design:type", String)
], ApiErrorItem.prototype, "message", void 0);
let PaginationMeta = class PaginationMeta {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 1
    }),
    _ts_metadata("design:type", Number)
], PaginationMeta.prototype, "page", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 20
    }),
    _ts_metadata("design:type", Number)
], PaginationMeta.prototype, "limit", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 248
    }),
    _ts_metadata("design:type", Number)
], PaginationMeta.prototype, "total", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 13
    }),
    _ts_metadata("design:type", Number)
], PaginationMeta.prototype, "totalPages", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: true
    }),
    _ts_metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasNext", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: false
    }),
    _ts_metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasPrev", void 0);
let MetaWithPagination = class MetaWithPagination {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: PaginationMeta
    }),
    _ts_metadata("design:type", typeof PaginationMeta === "undefined" ? Object : PaginationMeta)
], MetaWithPagination.prototype, "pagination", void 0);
let SuccessResponse = class SuccessResponse {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: true
    }),
    _ts_metadata("design:type", Boolean)
], SuccessResponse.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 200
    }),
    _ts_metadata("design:type", Number)
], SuccessResponse.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'OK'
    }),
    _ts_metadata("design:type", String)
], SuccessResponse.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof T === "undefined" ? Object : T)
], SuccessResponse.prototype, "data", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], SuccessResponse.prototype, "meta", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        nullable: true,
        example: null,
        type: Object
    }),
    _ts_metadata("design:type", void 0)
], SuccessResponse.prototype, "errors", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '2026-04-22T00:00:00+00:00'
    }),
    _ts_metadata("design:type", String)
], SuccessResponse.prototype, "timestamp", void 0);
let PaginatedResponse = class PaginatedResponse {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: true
    }),
    _ts_metadata("design:type", Boolean)
], PaginatedResponse.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 200
    }),
    _ts_metadata("design:type", Number)
], PaginatedResponse.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'OK'
    }),
    _ts_metadata("design:type", String)
], PaginatedResponse.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        isArray: true
    }),
    _ts_metadata("design:type", Array)
], PaginatedResponse.prototype, "data", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: MetaWithPagination
    }),
    _ts_metadata("design:type", typeof MetaWithPagination === "undefined" ? Object : MetaWithPagination)
], PaginatedResponse.prototype, "meta", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        nullable: true,
        example: null,
        type: Object
    }),
    _ts_metadata("design:type", void 0)
], PaginatedResponse.prototype, "errors", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '2026-04-22T00:00:00+00:00'
    }),
    _ts_metadata("design:type", String)
], PaginatedResponse.prototype, "timestamp", void 0);
let ErrorResponse = class ErrorResponse {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: false
    }),
    _ts_metadata("design:type", Boolean)
], ErrorResponse.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 404
    }),
    _ts_metadata("design:type", Number)
], ErrorResponse.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'User not found'
    }),
    _ts_metadata("design:type", String)
], ErrorResponse.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        nullable: true,
        example: null,
        type: Object
    }),
    _ts_metadata("design:type", void 0)
], ErrorResponse.prototype, "data", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        nullable: true,
        example: null,
        type: Object
    }),
    _ts_metadata("design:type", void 0)
], ErrorResponse.prototype, "meta", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: [
            ApiErrorItem
        ]
    }),
    _ts_metadata("design:type", Array)
], ErrorResponse.prototype, "errors", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '2026-04-22T00:00:00+00:00'
    }),
    _ts_metadata("design:type", String)
], ErrorResponse.prototype, "timestamp", void 0);
var ErrorCode = /*#__PURE__*/ function(ErrorCode) {
    // AUTH
    ErrorCode["AUTH_TOKEN_MISSING"] = "AUTH_TOKEN_MISSING";
    ErrorCode["AUTH_TOKEN_INVALID"] = "AUTH_TOKEN_INVALID";
    ErrorCode["AUTH_TOKEN_EXPIRED"] = "AUTH_TOKEN_EXPIRED";
    ErrorCode["AUTH_TOKEN_REVOKED"] = "AUTH_TOKEN_REVOKED";
    ErrorCode["AUTH_REFRESH_TOKEN_EXPIRED"] = "AUTH_REFRESH_TOKEN_EXPIRED";
    ErrorCode["AUTH_PERMISSION_DENIED"] = "AUTH_PERMISSION_DENIED";
    ErrorCode["AUTH_ROLE_INSUFFICIENT"] = "AUTH_ROLE_INSUFFICIENT";
    ErrorCode["AUTH_LOGIN_INVALID_CREDENTIALS"] = "AUTH_LOGIN_INVALID_CREDENTIALS";
    ErrorCode["AUTH_LOGIN_TOO_MANY_ATTEMPTS"] = "AUTH_LOGIN_TOO_MANY_ATTEMPTS";
    ErrorCode["AUTH_2FA_CODE_INVALID"] = "AUTH_2FA_CODE_INVALID";
    ErrorCode["AUTH_2FA_CODE_EXPIRED"] = "AUTH_2FA_CODE_EXPIRED";
    // USER
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["USER_EMAIL_DUPLICATE"] = "USER_EMAIL_DUPLICATE";
    ErrorCode["USER_ACCOUNT_DISABLED"] = "USER_ACCOUNT_DISABLED";
    ErrorCode["USER_EMAIL_INVALID"] = "USER_EMAIL_INVALID";
    ErrorCode["USER_EMAIL_NOT_VERIFIED"] = "USER_EMAIL_NOT_VERIFIED";
    ErrorCode["USER_PASSWORD_TOO_SHORT"] = "USER_PASSWORD_TOO_SHORT";
    ErrorCode["USER_PASSWORD_TOO_WEAK"] = "USER_PASSWORD_TOO_WEAK";
    ErrorCode["USER_PASSWORD_INCORRECT"] = "USER_PASSWORD_INCORRECT";
    ErrorCode["USER_ACCOUNT_DELETED"] = "USER_ACCOUNT_DELETED";
    ErrorCode["USER_PHONE_DUPLICATE"] = "USER_PHONE_DUPLICATE";
    ErrorCode["USER_PHONE_INVALID"] = "USER_PHONE_INVALID";
    // VALIDATION
    ErrorCode["VALIDATION_REQUIRED"] = "VALIDATION_REQUIRED";
    ErrorCode["VALIDATION_INVALID_FORMAT"] = "VALIDATION_INVALID_FORMAT";
    ErrorCode["VALIDATION_INVALID_TYPE"] = "VALIDATION_INVALID_TYPE";
    ErrorCode["VALIDATION_TOO_SHORT"] = "VALIDATION_TOO_SHORT";
    ErrorCode["VALIDATION_TOO_LONG"] = "VALIDATION_TOO_LONG";
    ErrorCode["VALIDATION_TOO_SMALL"] = "VALIDATION_TOO_SMALL";
    ErrorCode["VALIDATION_TOO_LARGE"] = "VALIDATION_TOO_LARGE";
    ErrorCode["VALIDATION_INVALID_ENUM"] = "VALIDATION_INVALID_ENUM";
    ErrorCode["VALIDATION_INVALID_DATE"] = "VALIDATION_INVALID_DATE";
    ErrorCode["VALIDATION_DATE_IN_PAST"] = "VALIDATION_DATE_IN_PAST";
    ErrorCode["VALIDATION_DATE_IN_FUTURE"] = "VALIDATION_DATE_IN_FUTURE";
    // FILE
    ErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ErrorCode["FILE_UPLOAD_TOO_LARGE"] = "FILE_UPLOAD_TOO_LARGE";
    ErrorCode["FILE_UPLOAD_INVALID_TYPE"] = "FILE_UPLOAD_INVALID_TYPE";
    ErrorCode["FILE_UPLOAD_CORRUPTED"] = "FILE_UPLOAD_CORRUPTED";
    ErrorCode["FILE_UPLOAD_LIMIT_EXCEEDED"] = "FILE_UPLOAD_LIMIT_EXCEEDED";
    ErrorCode["FILE_STORAGE_FULL"] = "FILE_STORAGE_FULL";
    // SYSTEM
    ErrorCode["SYSTEM_INTERNAL_ERROR"] = "SYSTEM_INTERNAL_ERROR";
    ErrorCode["SYSTEM_BAD_REQUEST"] = "SYSTEM_BAD_REQUEST";
    ErrorCode["SYSTEM_RESOURCE_NOT_FOUND"] = "SYSTEM_RESOURCE_NOT_FOUND";
    ErrorCode["SYSTEM_METHOD_NOT_ALLOWED"] = "SYSTEM_METHOD_NOT_ALLOWED";
    ErrorCode["SYSTEM_RATE_LIMIT_EXCEEDED"] = "SYSTEM_RATE_LIMIT_EXCEEDED";
    ErrorCode["SYSTEM_SERVICE_UNAVAILABLE"] = "SYSTEM_SERVICE_UNAVAILABLE";
    ErrorCode["SYSTEM_REQUEST_TIMEOUT"] = "SYSTEM_REQUEST_TIMEOUT";
    ErrorCode["SYSTEM_NOT_IMPLEMENTED"] = "SYSTEM_NOT_IMPLEMENTED";
    ErrorCode["SYSTEM_BAD_GATEWAY"] = "SYSTEM_BAD_GATEWAY";
    ErrorCode["SYSTEM_GATEWAY_TIMEOUT"] = "SYSTEM_GATEWAY_TIMEOUT";
    ErrorCode["SYSTEM_DATABASE_ERROR"] = "SYSTEM_DATABASE_ERROR";
    ErrorCode["SYSTEM_ENDPOINT_REMOVED"] = "SYSTEM_ENDPOINT_REMOVED";
    ErrorCode["SYSTEM_UNSUPPORTED_MEDIA_TYPE"] = "SYSTEM_UNSUPPORTED_MEDIA_TYPE";
    ErrorCode["SYSTEM_IDEMPOTENCY_KEY_CONFLICT"] = "SYSTEM_IDEMPOTENCY_KEY_CONFLICT";
    ErrorCode["SYSTEM_REQUEST_IN_PROGRESS"] = "SYSTEM_REQUEST_IN_PROGRESS";
    return ErrorCode;
}({});
const STATUS_TO_ERROR_CODE = {
    400: "SYSTEM_BAD_REQUEST",
    401: "AUTH_TOKEN_MISSING",
    403: "AUTH_PERMISSION_DENIED",
    404: "SYSTEM_RESOURCE_NOT_FOUND",
    405: "SYSTEM_METHOD_NOT_ALLOWED",
    408: "SYSTEM_REQUEST_TIMEOUT",
    409: "SYSTEM_REQUEST_IN_PROGRESS",
    410: "SYSTEM_ENDPOINT_REMOVED",
    413: "FILE_UPLOAD_TOO_LARGE",
    415: "SYSTEM_UNSUPPORTED_MEDIA_TYPE",
    422: "VALIDATION_REQUIRED",
    429: "SYSTEM_RATE_LIMIT_EXCEEDED",
    500: "SYSTEM_INTERNAL_ERROR",
    501: "SYSTEM_NOT_IMPLEMENTED",
    502: "SYSTEM_BAD_GATEWAY",
    503: "SYSTEM_SERVICE_UNAVAILABLE",
    504: "SYSTEM_GATEWAY_TIMEOUT",
    507: "FILE_STORAGE_FULL"
};

//# sourceMappingURL=response.dto.js.map