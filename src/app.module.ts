import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './entities/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './entities/auth/auth.module';
import { BusinessModule } from './entities/business/business.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to be able to inject ConfigService
      useFactory: async (configService: ConfigService) => {
        // Construct the connection string
        const uri = configService.get<string>('DATABASE_HOST');

        return {
          uri, // Return the connection string to Mongoose
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    BusinessModule,
  ],
  // controllers: [BusinessController],
})
export class AppModule {}
