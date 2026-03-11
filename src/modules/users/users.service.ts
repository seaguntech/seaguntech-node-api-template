import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { RedisService } from '../../infrastructure/cache/redis/redis.service';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserSummary = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type UserListResponse = {
  message: string;
  data: {
    users: UserSummary[];
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RedisService)
    private readonly redis: RedisService,
  ) {}

  async createUser(
    payload: CreateUserDto,
  ): Promise<{ message: string; data: { user: UserSummary } }> {
    const passwordHash = await argon2.hash(payload.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email.toLowerCase(),
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await this.invalidateUsersCache();

      return {
        message: 'User created successfully.',
        data: { user },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async listUsers(query: QueryUsersDto): Promise<UserListResponse> {
    const page = Number(query.page);
    const limit = Number(query.limit);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const cacheKey = `users:list:${page}:${limit}:${sortBy}:${sortOrder}`;

    const cachedData = await this.redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData) as UserListResponse;
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    const result: UserListResponse = {
      message: 'Users fetched successfully.',
      data: {
        users,
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.redis.setex(cacheKey, 30, JSON.stringify(result));

    return result;
  }

  async getUserById(userId: string): Promise<{ message: string; data: { user: UserSummary } }> {
    const cacheKey = `users:item:${userId}`;
    const cachedData = await this.redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData) as {
        message: string;
        data: { user: UserSummary };
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = {
      message: 'User fetched successfully.',
      data: { user },
    };

    await this.redis.setex(cacheKey, 30, JSON.stringify(result));

    return result;
  }

  async updateUser(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<{ message: string; data: { user: UserSummary } }> {
    const updateData: {
      email?: string;
      passwordHash?: string;
    } = {};

    if (payload.email) {
      updateData.email = payload.email.toLowerCase();
    }

    if (payload.password) {
      updateData.passwordHash = await argon2.hash(payload.password);
    }

    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: updateData,
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await this.redis.del(`users:item:${userId}`);
      await this.invalidateUsersCache();

      return {
        message: 'User updated successfully.',
        data: {
          user,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });

      await this.redis.del(`users:item:${userId}`);
      await this.invalidateUsersCache();

      return {
        message: 'User deleted successfully.',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }

  private async invalidateUsersCache(): Promise<void> {
    await this.redis.delByPrefix('users:list:');
  }
}
