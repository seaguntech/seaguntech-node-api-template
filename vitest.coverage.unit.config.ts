import { defineConfig, mergeConfig } from 'vitest/config';
import unitConfig from './vitest.unit.config';

export default mergeConfig(
  unitConfig,
  defineConfig({
    test: {
      coverage: {
        include: ['src/modules/auth/auth.service.ts', 'src/modules/health/health.service.ts'],
        thresholds: {
          lines: 60,
          functions: 70,
          branches: 55,
          statements: 60,
        },
      },
    },
  }),
);
