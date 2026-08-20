"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersService", {
    enumerable: true,
    get: function() {
        return UsersService;
    }
});
const _common = require("@nestjs/common");
const _nestjspino = require("nestjs-pino");
const _usersrepository = require("./repositories/users.repository");
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
let UsersService = class UsersService {
    async findByEmail(email) {
        return this.repo.findByEmail(email);
    }
    async findById(id) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new _common.NotFoundException(`User #${id} not found`);
        }
        return user;
    }
    async createUser(data) {
        this.logger.info(`Creating user: ${data.email}`);
        const fullName = [
            data.firstName,
            data.lastName
        ].filter(Boolean).join(' ') || undefined;
        const user = await this.repo.create({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            userProfile: {
                create: {
                    fullName,
                    isDraft: true,
                    completionPct: 0
                }
            },
            userRoles: {
                create: {
                    roleId: 1
                }
            }
        });
        return user;
    }
    async createProfile(userId, fullName) {
        return this.repo.createProfile(userId, fullName);
    }
    async getUserWithProfile(id) {
        return this.findById(id);
    }
    async updateLastLogin(id) {
        return this.repo.update(id, {
            lastLoginAt: new Date()
        });
    }
    async create(dto) {
        return this.createUser({
            email: dto.email,
            firstName: dto.name
        });
    }
    async findAll(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                {
                    email: {
                        contains: query.search,
                        mode: 'insensitive'
                    }
                },
                {
                    firstName: {
                        contains: query.search,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        contains: query.search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (query.role) {
            where.userRoles = {
                some: {
                    roles: {
                        name: {
                            equals: query.role,
                            mode: 'insensitive'
                        }
                    },
                    isActive: true
                }
            };
        }
        const orderBy = {
            [query.sort ?? 'createdAt']: query.order ?? 'desc'
        };
        const [data, total] = await Promise.all([
            this.repo.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy
            }),
            this.repo.count(where)
        ]);
        const totalPages = Math.ceil(total / query.limit);
        return {
            data,
            total,
            page: query.page,
            limit: query.limit,
            totalPages,
            hasNext: query.page < totalPages,
            hasPrev: query.page > 1
        };
    }
    async findOne(id) {
        return this.findById(id);
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.repo.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.repo.delete(id);
    }
    constructor(logger, repo){
        this.logger = logger;
        this.repo = repo;
    }
};
UsersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _nestjspino.InjectPinoLogger)(UsersService.name)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger,
        typeof _usersrepository.UsersRepository === "undefined" ? Object : _usersrepository.UsersRepository
    ])
], UsersService);

//# sourceMappingURL=users.service.js.map