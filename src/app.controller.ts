import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Common')
@Controller()
export class AppController {
  @Get('/health-check')
  healthCheck(): string {
    return 'This server is healthy';
  }

  @Get('error')
  getError() {
    const lsw = null;
    return lsw.toString();
  }
}
