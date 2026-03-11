import { Injectable } from '@nestjs/common';

type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

@Injectable()
export class HealthService {
  getLiveness(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
