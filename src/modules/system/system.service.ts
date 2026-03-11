import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemService {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  getInfo() {
    return {
      name: this.configService.get<string>('app.name'),
      env: this.configService.get<string>('app.env'),
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
