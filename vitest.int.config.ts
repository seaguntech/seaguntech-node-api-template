import { defineConfig, mergeConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default mergeConfig(
  defaultConfig,
  defineConfig({
    test: {
      include: ['test/int/**/*.test.ts'],
      env: {
        NODE_ENV: 'test',
        APP_NAME: 'seaguntech-node-api-template',
        HOST: '127.0.0.1',
        PORT: '3000',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
        REDIS_URL: 'redis://localhost:6379',
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_TTL: '15m',
        JWT_REFRESH_TTL: '7d',
      },
    },
  }),
);
