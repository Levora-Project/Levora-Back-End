"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserQueryDto", {
    enumerable: true,
    get: function() {
        return UserQueryDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classvalidator = require("class-validator");
const _dto = require("../../../../dist/common/dto");
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
const SORTABLE_FIELDS = [
    'createdAt',
    'updatedAt',
    'email',
    'name',
    'role'
];
let UserQueryDto = class UserQueryDto extends _dto.PaginationDto {
    constructor(...args){
        super(...args), this.sort = 'createdAt', this.order = 'desc';
    }
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Search by name or email',
        example: 'john'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UserQueryDto.prototype, "search", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Filter by role',
        enum: [
            'USER',
            'ADMIN'
        ],
        example: 'USER'
    }),
    (0, _classvalidator.IsEnum)([
        'USER',
        'ADMIN'
    ]),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Sort field',
        enum: SORTABLE_FIELDS,
        default: 'createdAt',
        example: 'updatedAt'
    }),
    (0, _classvalidator.IsIn)(SORTABLE_FIELDS),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof UserSortField === "undefined" ? Object : UserSortField)
], UserQueryDto.prototype, "sort", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Sort order',
        enum: [
            'asc',
            'desc'
        ],
        default: 'desc',
        example: 'desc'
    }),
    (0, _classvalidator.IsIn)([
        'asc',
        'desc'
    ]),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UserQueryDto.prototype, "order", void 0);

//# sourceMappingURL=user-query.dto.js.map