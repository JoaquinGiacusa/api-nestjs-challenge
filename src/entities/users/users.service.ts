import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from 'src/entities/users/dto/create-user.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async getAllBusinessUsers(
    page: number,
    limit: number,
    email: string,
    token: string,
  ): Promise<Observable<UserDocument>> {
    try {
      const url = `${this.configService.get<string>('BASE_URL')}/business/list?page=${page}&limit=${limit}&email=${email}`;

      const paginatedUsers = this.httpService
        .get(url, {
          headers: {
            'x-source': this.configService.get<string>('X_SOURCE_HEADER'),
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          map((response) => response.data), // Extract the data from the response
        );

      return paginatedUsers;
    } catch (error) {
      return error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({
        email,
      })
      .exec();

    return user;
  }

  async delete(id: string): Promise<string> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        return 'User not found';
      }
      await this.userModel.findByIdAndDelete(id).exec();
      return 'User deleted';
    } catch (error) {
      console.log(error);
    }
  }
}
