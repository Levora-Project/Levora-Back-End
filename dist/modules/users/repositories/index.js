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
    get USER_SELECT () {
        return _usersrepository.USER_SELECT;
    },
    get UserRolesRepository () {
        return _userrolesrepository.UserRolesRepository;
    },
    get UsersRepository () {
        return _usersrepository.UsersRepository;
    }
});
const _usersrepository = require("./users.repository");
const _userrolesrepository = require("./user-roles.repository");

//# sourceMappingURL=index.js.map