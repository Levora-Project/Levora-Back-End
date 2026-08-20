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
    get RedisModule () {
        return _redismodule.RedisModule;
    },
    get RedisService () {
        return _redisservice.RedisService;
    }
});
const _redismodule = require("./redis.module");
const _redisservice = require("./redis.service");

//# sourceMappingURL=index.js.map