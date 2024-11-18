import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('email') email: string = '',
    @Headers('authorization') authorization: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const token = authorization.replace('Bearer ', '');

    const allUsers = await this.usersService.getAllBusinessUsers(
      pageNumber,
      limitNumber,
      email,
      token,
    );

    return allUsers;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
