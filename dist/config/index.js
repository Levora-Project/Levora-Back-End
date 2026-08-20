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
    get appConfig () {
        return _appconfig.appConfig;
    },
    get databaseConfig () {
        return _databaseconfig.databaseConfig;
    },
    get logConfig () {
        return _logconfig.logConfig;
    },
    get redisConfig () {
        return _redisconfig.redisConfig;
    },
    get securityConfig () {
        return _securityconfig.securityConfig;
    },
    get uploadConfig () {
        return _uploadconfig.uploadConfig;
    }
});
const _appconfig = require("./app.config");
const _databaseconfig = require("./database.config");
const _logconfig = require("./log.config");
const _redisconfig = require("./redis.config");
const _securityconfig = require("./security.config");
const _uploadconfig = require("./upload.config");

//# sourceMappingURL=index.js.map