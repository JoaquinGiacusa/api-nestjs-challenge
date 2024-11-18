import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly saltRounds: number;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS'),
      10,
    );
  }

  async registerUser(body: CreateUserDto): Promise<any> {
    const { email, password, confirmPassword, firstName, lastName } = body;

    // Check if the user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    try {
      // Create the user
      const createdUser = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      const payload = { sub: createdUser.id, emaill: createdUser.email };

      const accessToken = await this.jwtService.signAsync(payload);

      delete createdUser.password;

      return {
        accessToken,
        user: createdUser,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create user. Error: ${error.message}`,
      );
    }
  }

  async loginUser(
    loginBody: LoginDto,
  ): Promise<{ accessToken: string; user: User }> {
    const { email, password: enteredPsw } = loginBody;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(enteredPsw, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    delete user.password;

    return {
      accessToken,
      user,
    };
  }
}
