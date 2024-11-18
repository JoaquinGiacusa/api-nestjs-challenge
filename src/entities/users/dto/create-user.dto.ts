import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from 'src/config/constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_MESSAGE,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_MESSAGE,
  })
  confirmPassword?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
