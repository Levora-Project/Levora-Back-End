"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersController", {
    enumerable: true,
    get: function() {
        return UsersController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _usersservice = require("./users.service");
const _dto = require("./dto");
const _dto1 = require("../../../dist/common/dto");
const _decorators = require("../../../dist/common/decorators");
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
let UsersController = class UsersController {
    getProfile(userId) {
        return this.usersService.getUserWithProfile(userId);
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll(query) {
        return this.usersService.findAll(query);
    }
    findOne(params) {
        return this.usersService.findOne(params.id);
    }
    update(params, updateUserDto) {
        return this.usersService.update(params.id, updateUserDto);
    }
    remove(params) {
        return this.usersService.remove(params.id);
    }
    constructor(usersService){
        this.usersService = usersService;
    }
};
_ts_decorate([
    (0, _common.Get)('profile'),
    (0, _decorators.ResponseMessage)('Profile retrieved successfully'),
    (0, _swagger.ApiOperation)({
        summary: 'Get current authenticated user profile'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Own user profile',
        type: _dto.UserDataResponse
    }),
    _ts_param(0, (0, _decorators.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _decorators.Roles)('system_admin', 'ADMIN'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    (0, _decorators.ResponseMessage)('User created successfully'),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new user (admin only)'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'User created successfully',
        type: _dto.UserDataResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 422,
        description: 'Validation error',
        type: _dto1.ErrorResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 403,
        description: 'Forbidden',
        type: _dto1.ErrorResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 409,
        description: 'Email already exists',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateUserDto === "undefined" ? Object : _dto.CreateUserDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _decorators.Roles)('system_admin', 'ADMIN', 'content_admin'),
    (0, _decorators.ResponseMessage)('OK'),
    (0, _swagger.ApiOperation)({
        summary: 'List all users (paginated)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Paginated list of users',
        type: _dto.UserListResponseDto
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.UserQueryDto === "undefined" ? Object : _dto.UserQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _decorators.Roles)('system_admin', 'ADMIN', 'content_admin'),
    (0, _decorators.ResponseMessage)('OK'),
    (0, _swagger.ApiOperation)({
        summary: 'Get user by ID (admin only)'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'User ID (UUID)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'User found',
        type: _dto.UserDataResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'User not found',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Param)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.UserParamsDto === "undefined" ? Object : _dto.UserParamsDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _decorators.Roles)('system_admin', 'ADMIN'),
    (0, _decorators.ResponseMessage)('User updated successfully'),
    (0, _swagger.ApiOperation)({
        summary: 'Update user'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'User ID (UUID)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'User updated',
        type: _dto.UserDataResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 422,
        description: 'Validation error',
        type: _dto1.ErrorResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'User not found',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Param)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.UserParamsDto === "undefined" ? Object : _dto.UserParamsDto,
        typeof _dto.UpdateUserDto === "undefined" ? Object : _dto.UpdateUserDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _decorators.Roles)('system_admin', 'ADMIN'),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    (0, _swagger.ApiOperation)({
        summary: 'Delete user (admin only)'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'User ID (UUID)'
    }),
    (0, _swagger.ApiResponse)({
        status: 204,
        description: 'User deleted'
    }),
    (0, _swagger.ApiResponse)({
        status: 403,
        description: 'Forbidden',
        type: _dto1.ErrorResponse
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'User not found',
        type: _dto1.ErrorResponse
    }),
    _ts_param(0, (0, _common.Param)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.UserParamsDto === "undefined" ? Object : _dto.UserParamsDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
UsersController = _ts_decorate([
    (0, _swagger.ApiTags)('Users'),
    (0, _swagger.ApiBearerAuth)(),
    (0, _common.Controller)('users'),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
        type: _dto1.ErrorResponse
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService
    ])
], UsersController);

//# sourceMappingURL=users.controller.js.map