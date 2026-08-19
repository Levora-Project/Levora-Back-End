import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';

/**
 * UsersService – business logic for user management.
 *
 * All database access goes through UsersRepository.
 * When schema changes after db pull, only the repository needs updating.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly repo: UsersRepository,
  ) {}

  async create(dto: CreateUserDto) {
    this.logger.info(`Creating user: ${dto.email}`);
    const user = await this.repo.create({
      email: dto.email,
      firstName: dto.name,
    });

    return user;
  }

  async findAll(query: UserQueryDto) {
    const where: Prisma.UsersWhereInput = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.userRoles = {
        some: {
          roles: { name: { equals: query.role, mode: 'insensitive' } },
          isActive: true,
        },
      };
    }

    const orderBy = {
      [query.sort ?? 'createdAt']: query.order ?? 'desc',
    } as Prisma.UsersOrderByWithRelationInput;

    const [data, total] = await Promise.all([
      this.repo.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy,
      }),
      this.repo.count(where),
    ]);

    const totalPages = Math.ceil(total / query.limit);
    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    };
  }

  async findOne(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.repo.update(id, dto as Prisma.UsersUpdateInput);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
