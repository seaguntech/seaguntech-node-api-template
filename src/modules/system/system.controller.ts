import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(
    @Inject(SystemService)
    private readonly systemService: SystemService,
  ) {}

  @Get('info')
  @ApiOperation({ summary: 'Get system information' })
  getInfo() {
    return this.systemService.getInfo();
  }
}
