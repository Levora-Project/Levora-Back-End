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
        return USER_SELECT;
    },
    get UsersRepository () {
        return UsersRepository;
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
const USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    userProfile: {
        select: {
            fullName: true,
            completionPct: true,
            isDraft: true
        }
    },
    userRoles: {
        where: {
            isActive: true
        },
        select: {
            roles: {
                select: {
                    name: true
                }
            }
        }
    }
};
let UsersRepository = class UsersRepository {
    findByEmail(email) {
        return this.prisma.users.findUnique({
            where: {
                email
            },
            select: USER_SELECT
        });
    }
    findByEmailRaw(email, args) {
        return this.prisma.users.findUnique({
            where: {
                email
            },
            ...args ?? {}
        });
    }
    findById(id) {
        return this.prisma.users.findUnique({
            where: {
                id
            },
            select: USER_SELECT
        });
    }
    findByIdRaw(id, args) {
        return this.prisma.users.findUnique({
            where: {
                id
            },
            ...args ?? {}
        });
    }
    findUniqueRaw(args) {
        return this.prisma.users.findUnique(args);
    }
    findFirstRaw(args) {
        return this.prisma.users.findFirst(args);
    }
    create(data) {
        return this.prisma.users.create({
            data,
            select: USER_SELECT
        });
    }
    findMany(args = {}) {
        return this.prisma.users.findMany({
            ...args,
            select: USER_SELECT
        });
    }
    count(where) {
        return this.prisma.users.count({
            where
        });
    }
    update(id, data) {
        return this.prisma.users.update({
            where: {
                id
            },
            data,
            select: USER_SELECT
        });
    }
    delete(id) {
        return this.prisma.users.delete({
            where: {
                id
            },
            select: USER_SELECT
        });
    }
    createProfile(userId, fullName) {
        return this.prisma.userProfiles.create({
            data: {
                userId,
                fullName,
                isDraft: true,
                completionPct: 0
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
UsersRepository = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prisma.PrismaService === "undefined" ? Object : _prisma.PrismaService
    ])
], UsersRepository);

//# sourceMappingURL=users.repository.js.map