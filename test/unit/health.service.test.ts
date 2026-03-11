import { describe, expect, it } from 'vitest';
import { HealthService } from '../../src/modules/health/health.service';

describe('HealthService', () => {
  const healthService = new HealthService();

  it('returns liveness payload', () => {
    expect(healthService.getLiveness()).toMatchObject({
      status: 'ok',
    });
  });

  it('returns readiness payload', () => {
    expect(healthService.getReadiness()).toMatchObject({
      status: 'ok',
    });
  });
});
