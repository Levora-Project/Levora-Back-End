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
    get CreateUserDto () {
        return _createuserdto.CreateUserDto;
    },
    get UpdateUserDto () {
        return _updateuserdto.UpdateUserDto;
    },
    get UserDataResponse () {
        return _userresponsedto.UserDataResponse;
    },
    get UserListResponseDto () {
        return _userresponsedto.UserListResponseDto;
    },
    get UserParamsDto () {
        return _userparamsdto.UserParamsDto;
    },
    get UserQueryDto () {
        return _userquerydto.UserQueryDto;
    },
    get UserResponseDto () {
        return _userresponsedto.UserResponseDto;
    }
});
const _createuserdto = require("./create-user.dto");
const _updateuserdto = require("./update-user.dto");
const _userparamsdto = require("./user-params.dto");
const _userquerydto = require("./user-query.dto");
const _userresponsedto = require("./user-response.dto");

//# sourceMappingURL=index.js.map