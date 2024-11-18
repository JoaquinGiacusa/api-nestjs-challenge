import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { UsersService } from '../users.service';
import { User, UserDocument } from '../../../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { Model } from 'mongoose';

class EventModel {
  constructor(private data) {}
  save = jest.fn().mockResolvedValue({ _id: '1', ...this.data });
  static new = jest.fn().mockImplementation((dto) => new EventModel(dto));
  static find = jest.fn();
  static findById = jest.fn();
  static findOne = jest.fn();
  static findByIdAndDelete = jest.fn();
  static exec = jest.fn();
}

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: EventModel,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@test.com',
      password: '1234qweR?',
      firstName: 'John',
      lastName: 'Doe',
    };
    const createdUser = { _id: '1', ...createUserDto };

    const result = await service.create(createUserDto);
    expect(result).toEqual(createdUser);
  });

  it('should find a user by id', async () => {
    const userId = '1';
    const user = { _id: userId, email: 'test@test.com', password: 'password' };
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.findById(userId);
    expect(result).toEqual(user);
  });

  it('should get all business users', async () => {
    const page = 1;
    const limit = 10;
    const email = 'test@test.com';
    const token = 'token';
    const users = [{ _id: '1', email: 'test@test.com', password: 'password' }];

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'BASE_URL':
          return 'http://localhost';
        case 'PORT':
          return '3000';
        case 'X_SOURCE_HEADER':
          return 'source';
        default:
          return null;
      }
    });

    const mockAxiosResponse: AxiosResponse = {
      data: users,
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders(),
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

    const result = await service.getAllBusinessUsers(page, limit, email, token);
    result.subscribe((data) => {
      expect(data).toEqual(users);
    });
  });

  it('should find a user by email', async () => {
    const email = 'test@test.com';
    const user = { _id: '1', email, password: 'password' };
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.findByEmail(email);
    expect(result).toEqual(user);
  });

  it('should delete a user', async () => {
    const userId = '1';
    const user = { _id: userId, email: 'test@test.com', password: 'password' };
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });
    userModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.delete(userId);
    expect(result).toEqual('User deleted');
  });

  it('should return "User not found" when deleting a non-existing user', async () => {
    const userId = '1';
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await service.delete(userId);
    expect(result).toEqual('User not found');
  });
});
