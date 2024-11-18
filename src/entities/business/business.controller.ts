import { Controller, Get, Query, Headers, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @UseGuards(AuthGuard)
  @Get('list')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('email') email: string = '',
    @Headers('x-source') source: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    return this.businessService.getUsersPaginated(
      pageNumber,
      limitNumber,
      email,
      source,
    );
  }
}
