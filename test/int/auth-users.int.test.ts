import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthBody = {
  data: {
    user: {
      id: string;
      email: string;
    };
    tokens: AuthTokens;
  };
};

type UserBody = {
  data: {
    user: {
      id: string;
      email: string;
    };
  };
};

describe('Auth and Users integration', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await redis.flushdb();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await redis.quit();
  });

  it('register -> login -> profile -> refresh -> logout flow works', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    const registerResponse = await request(httpServer).post('/api/v1/auth/register').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(registerResponse.status).toBe(201);
    const registerBody = registerResponse.body as AuthBody;

    expect(registerBody.data.user.email).toBe('alice@example.com');

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    const loginBody = loginResponse.body as AuthBody;

    const accessToken = loginBody.data.tokens.accessToken;
    const refreshToken = loginBody.data.tokens.refreshToken;

    const profileResponse = await request(httpServer)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(profileResponse.status).toBe(200);
    const profileBody = profileResponse.body as { email: string };

    expect(profileBody.email).toBe('alice@example.com');

    const refreshResponse = await request(httpServer).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(refreshResponse.status).toBe(200);
    const refreshBody = refreshResponse.body as AuthTokens;

    const oldRefreshTokenReuse = await request(httpServer).post('/api/v1/auth/refresh').send({
      refreshToken,
    });

    expect(oldRefreshTokenReuse.status).toBe(401);

    const logoutResponse = await request(httpServer).post('/api/v1/auth/logout').send({
      refreshToken: refreshBody.refreshToken,
    });

    expect(logoutResponse.status).toBe(204);
  });

  it('supports users pagination with authenticated token', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).post('/api/v1/auth/register').send({
      email: 'owner@example.com',
      password: 'password123',
    });

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'owner@example.com',
      password: 'password123',
    });

    const loginBody = loginResponse.body as AuthBody;
    const accessToken = loginBody.data.tokens.accessToken;

    for (let i = 1; i <= 3; i += 1) {
      await request(httpServer)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: `user${i}@example.com`,
          password: 'password123',
        });
    }

    const listResponse = await request(httpServer)
      .get('/api/v1/users?page=1&limit=2')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    const listBody = listResponse.body as {
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      data: {
        users: unknown[];
      };
    };

    expect(listBody.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: 4,
      totalPages: 2,
    });
    expect(listBody.data.users).toHaveLength(2);
  });

  it('invalidates users list cache after creating a user', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).post('/api/v1/auth/register').send({
      email: 'cache-owner@example.com',
      password: 'password123',
    });

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'cache-owner@example.com',
      password: 'password123',
    });

    const loginBody = loginResponse.body as AuthBody;
    const accessToken = loginBody.data.tokens.accessToken;

    const firstListResponse = await request(httpServer)
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);

    const firstListBody = firstListResponse.body as {
      meta: {
        total: number;
      };
    };

    await request(httpServer)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'cache-new@example.com',
        password: 'password123',
      });

    const secondListResponse = await request(httpServer)
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);

    const secondListBody = secondListResponse.body as {
      meta: {
        total: number;
      };
    };

    expect(secondListBody.meta.total).toBe(firstListBody.meta.total + 1);
  });

  it('returns 401 when accessing users endpoint without bearer token', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    const response = await request(httpServer).get('/api/v1/users?page=1&limit=10');

    expect(response.status).toBe(401);
  });

  it('returns 409 when creating duplicated user email', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).post('/api/v1/auth/register').send({
      email: 'dup-owner@example.com',
      password: 'password123',
    });

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'dup-owner@example.com',
      password: 'password123',
    });

    const accessToken = (loginResponse.body as AuthBody).data.tokens.accessToken;

    await request(httpServer)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'duplicated@example.com',
        password: 'password123',
      });

    const duplicatedResponse = await request(httpServer)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'duplicated@example.com',
        password: 'password123',
      });

    expect(duplicatedResponse.status).toBe(409);
  });

  it('returns 404 for update and delete on missing user', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).post('/api/v1/auth/register').send({
      email: 'missing-owner@example.com',
      password: 'password123',
    });

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'missing-owner@example.com',
      password: 'password123',
    });

    const accessToken = (loginResponse.body as AuthBody).data.tokens.accessToken;
    const missingUserId = '00000000-0000-4000-8000-000000000000';

    const updateResponse = await request(httpServer)
      .patch(`/api/v1/users/${missingUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'new@example.com',
      });

    const deleteResponse = await request(httpServer)
      .delete(`/api/v1/users/${missingUserId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it('returns 409 when updating user email to existing email', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).post('/api/v1/auth/register').send({
      email: 'owner-conflict@example.com',
      password: 'password123',
    });

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'owner-conflict@example.com',
      password: 'password123',
    });

    const accessToken = (loginResponse.body as AuthBody).data.tokens.accessToken;

    const firstUserResponse = await request(httpServer)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'first@example.com',
        password: 'password123',
      });

    await request(httpServer)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'second@example.com',
        password: 'password123',
      });

    const firstUserId = (firstUserResponse.body as UserBody).data.user.id;

    const conflictUpdateResponse = await request(httpServer)
      .patch(`/api/v1/users/${firstUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'second@example.com',
      });

    expect(conflictUpdateResponse.status).toBe(409);
  });

  it('updates user and invalidates item cache', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).post('/api/v1/auth/register').send({
      email: 'cache-item-owner@example.com',
      password: 'password123',
    });

    const loginResponse = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'cache-item-owner@example.com',
      password: 'password123',
    });

    const accessToken = (loginResponse.body as AuthBody).data.tokens.accessToken;

    const createdResponse = await request(httpServer)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'cache-item@example.com',
        password: 'password123',
      });

    const userId = (createdResponse.body as UserBody).data.user.id;

    const firstGetResponse = await request(httpServer)
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(firstGetResponse.status).toBe(200);

    const updateResponse = await request(httpServer)
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'cache-item-updated@example.com',
      });

    expect(updateResponse.status).toBe(200);

    const secondGetResponse = await request(httpServer)
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const secondGetBody = secondGetResponse.body as UserBody;

    expect(secondGetResponse.status).toBe(200);
    expect(secondGetBody.data.user.email).toBe('cache-item-updated@example.com');
  });
});
