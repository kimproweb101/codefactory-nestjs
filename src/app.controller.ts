import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

// [1] @Controller('post') @Get('post') 개념
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
