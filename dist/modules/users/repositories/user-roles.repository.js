"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserRolesRepository", {
    enumerable: true,
    get: function() {
        return UserRolesRepository;
    }
});
const _common = require("@nestjs/common");
const _prisma = require("../../../../dist/prisma");
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
const DEFAULT_USER_ROLE = 'USER';
let UserRolesRepository = class UserRolesRepository {
    async getCurrentRoleName(userId) {
        const userRole = await this.prisma.userRoles.findFirst({
            where: {
                userId,
                isActive: true
            },
            include: {
                roles: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return userRole?.roles?.name ?? DEFAULT_USER_ROLE;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
UserRolesRepository = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prisma.PrismaService === "undefined" ? Object : _prisma.PrismaService
    ])
], UserRolesRepository);

//# sourceMappingURL=user-roles.repository.js.map