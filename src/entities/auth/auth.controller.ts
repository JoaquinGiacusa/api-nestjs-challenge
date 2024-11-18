import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginBody: LoginDto) {
    return this.authService.loginUser(loginBody);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() loginBody: CreateUserDto) {
    return this.authService.registerUser(loginBody);
  }
}
