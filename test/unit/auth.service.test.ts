import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { describe, expect, it, vi } from 'vitest';
import type { RedisService } from '../../src/infrastructure/cache/redis/redis.service';
import type { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService', () => {
  it('logs in successfully with valid credentials', async () => {
    const password = 'password123';
    const passwordHash = await argon2.hash(password);

    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'test@demo.com',
          passwordHash,
        }),
      },
    } as unknown as PrismaService;

    const setexMock = vi.fn().mockResolvedValue(undefined);

    const redis = {
      setex: setexMock,
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
      verifyAsync: vi.fn(),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    const result = await service.login({
      email: 'test@demo.com',
      password,
    });

    expect(result.data.tokens.accessToken).toBe('access-token');
    expect(result.data.tokens.refreshToken).toBe('refresh-token');
    expect(setexMock).toHaveBeenCalledOnce();
  });

  it('rejects login with invalid credentials', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const redis = {
      setex: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    await expect(
      service.login({
        email: 'test@demo.com',
        password: 'wrongpassword',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects refresh token when session does not exist', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    const redis = {
      setex: vi.fn(),
      get: vi.fn().mockResolvedValue(null),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn().mockResolvedValue({
        sub: 'user-1',
        email: 'test@demo.com',
        sid: 'session-1',
      }),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    await expect(
      service.refreshTokens({
        refreshToken: 'refresh-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('registers a new user successfully', async () => {
    const prisma = {
      user: {
        create: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'new@demo.com',
        }),
      },
    } as unknown as PrismaService;

    const setexMock = vi.fn().mockResolvedValue(undefined);

    const redis = {
      setex: setexMock,
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
      verifyAsync: vi.fn(),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    const result = await service.register({
      email: 'new@demo.com',
      password: 'password123',
    });

    expect(result.data.user.email).toBe('new@demo.com');
    expect(result.data.tokens.accessToken).toBe('access-token');
  });

  it('throws ConflictException when registering with existing email', async () => {
    const prisma = {
      user: {
        create: vi.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: '5.0.0',
          }),
        ),
      },
    } as unknown as PrismaService;

    const redis = {
      setex: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    await expect(
      service.register({
        email: 'existing@demo.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs out and deletes refresh session', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    const delMock = vi.fn().mockResolvedValue(undefined);

    const redis = {
      setex: vi.fn(),
      get: vi.fn(),
      del: delMock,
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn().mockResolvedValue({
        sub: 'user-1',
        email: 'test@demo.com',
        sid: 'session-1',
      }),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    const result = await service.logout({
      refreshToken: 'refresh-token',
    });

    expect(result.message).toBe('Logout successfully.');
    expect(delMock).toHaveBeenCalled();
  });

  it('gets user profile successfully', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'test@demo.com',
        }),
      },
    } as unknown as PrismaService;

    const redis = {
      setex: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn(),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    const result = await service.profile({
      sub: 'user-1',
      email: 'test@demo.com',
      sid: 'session-1',
    });

    expect(result.email).toBe('test@demo.com');
  });

  it('throws UnauthorizedException when profile user not found', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const redis = {
      setex: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn(),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    await expect(
      service.profile({
        sub: 'nonexistent-user',
        email: 'test@demo.com',
        sid: 'session-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects refresh token when token hash mismatches', async () => {
    const storedHash = await argon2.hash('different-token');

    const prisma = {
      user: {
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    const redis = {
      setex: vi.fn(),
      get: vi.fn().mockResolvedValue(storedHash),
      del: vi.fn(),
    } as unknown as RedisService;

    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn().mockResolvedValue({
        sub: 'user-1',
        email: 'test@demo.com',
        sid: 'session-1',
      }),
    } as unknown as JwtService;

    const configService = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'auth.jwtAccessSecret': 'access-secret',
          'auth.jwtRefreshSecret': 'refresh-secret',
          'auth.jwtAccessTtl': '15m',
          'auth.jwtRefreshTtl': '7d',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AuthService(prisma, redis, jwtService, configService);

    await expect(
      service.refreshTokens({
        refreshToken: 'refresh-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
