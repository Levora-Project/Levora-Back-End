"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KeyvUpstashStore", {
    enumerable: true,
    get: function() {
        return KeyvUpstashStore;
    }
});
const _redis = require("@upstash/redis");
let KeyvUpstashStore = class KeyvUpstashStore {
    async get(key) {
        const val = await this.redis.get(key);
        if (val === null || val === undefined) {
            return undefined;
        }
        return val;
    }
    async set(key, value, ttl) {
        if (ttl && ttl > 0) {
            await this.redis.set(key, value, {
                px: ttl
            });
        } else {
            await this.redis.set(key, value);
        }
    }
    async delete(key) {
        const count = await this.redis.del(key);
        return count > 0;
    }
    async clear() {
    // Upstash clear store no-op for safety
    }
    constructor(options){
        this.opts = {};
        this.redis = new _redis.Redis({
            url: options.url,
            token: options.token
        });
    }
};

//# sourceMappingURL=keyv-upstash-redis.store.js.map