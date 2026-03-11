import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import ms from 'ms';
import type { StringValue } from 'ms';
import { randomUUID } from 'node:crypto';
import type { AuthUser } from '../../common/auth/auth-user.type';
import { RedisService } from '../../infrastructure/cache/redis/redis.service';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthResponse, AuthTokens } from './auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RedisService)
    private readonly redis: RedisService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async register(payload: RegisterDto): Promise<AuthResponse> {
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
        },
      });

      const tokens = await this.issueTokens({
        sub: user.id,
        email: user.email,
      });

      return {
        message: 'Register successfully.',
        data: {
          user,
          tokens,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await argon2.verify(user.passwordHash, payload.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Login successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        tokens,
      },
    };
  }

  async refreshTokens(payload: RefreshTokenDto): Promise<AuthTokens> {
    const tokenPayload = await this.verifyRefreshToken(payload.refreshToken);
    const redisKey = this.getRefreshSessionKey(tokenPayload.sub, tokenPayload.sid);
    const storedHash = await this.redis.get(redisKey);

    if (!storedHash) {
      throw new UnauthorizedException('Refresh session expired');
    }

    const isValidToken = await argon2.verify(storedHash, payload.refreshToken);

    if (!isValidToken) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    await this.redis.del(redisKey);

    return this.issueTokens({
      sub: tokenPayload.sub,
      email: tokenPayload.email,
    });
  }

  async logout(payload: RefreshTokenDto): Promise<{ message: string }> {
    const tokenPayload = await this.verifyRefreshToken(payload.refreshToken);

    await this.redis.del(this.getRefreshSessionKey(tokenPayload.sub, tokenPayload.sid));

    return { message: 'Logout successfully.' };
  }

  async profile(user: AuthUser): Promise<{ id: string; email: string }> {
    const profile = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!profile) {
      throw new UnauthorizedException('User not found');
    }

    return profile;
  }

  private async issueTokens(payload: { sub: string; email: string }): Promise<AuthTokens> {
    const sessionId = randomUUID();
    const tokenPayload: AuthUser = {
      sub: payload.sub,
      email: payload.email,
      sid: sessionId,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('auth.jwtAccessSecret'),
      expiresIn: this.configService.getOrThrow<string>('auth.jwtAccessTtl') as StringValue,
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
      expiresIn: this.configService.getOrThrow<string>('auth.jwtRefreshTtl') as StringValue,
    });

    const refreshTokenHash = await argon2.hash(refreshToken);

    await this.redis.setex(
      this.getRefreshSessionKey(payload.sub, sessionId),
      this.getRefreshTokenTtlInSeconds(),
      refreshTokenHash,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<AuthUser> {
    try {
      return await this.jwtService.verifyAsync<AuthUser>(refreshToken, {
        secret: this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getRefreshSessionKey(userId: string, sessionId: string): string {
    return `auth:refresh:${userId}:${sessionId}`;
  }

  private getRefreshTokenTtlInSeconds(): number {
    const ttl = this.configService.getOrThrow<string>('auth.jwtRefreshTtl');
    const parsedTtl = ms(ttl as StringValue);

    if (typeof parsedTtl !== 'number') {
      throw new Error('Invalid JWT_REFRESH_TTL format');
    }

    return Math.floor(parsedTtl / 1000);
  }
}
