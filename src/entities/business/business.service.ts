import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async getUsersPaginated(
    page: number,
    limit: number,
    email: string,
    source: string,
  ): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    page: number;
  }> {
    if (source !== this.configService.get<string>('X_SOURCE_HEADER')) {
      throw new UnauthorizedException('Access denied');
    }

    // Calculate the number of items to skip
    const skip = (page - 1) * limit;

    // Create the filter for the email (case-insensitive)
    const filter = email ? { email: { $regex: email, $options: 'i' } } : {};

    // Define the aggregation pipeline
    const aggregationPipeline = [
      // Match stage: filter by email if necessary
      { $match: filter },

      // Pagination stages: skip and limit the results
      { $skip: skip },
      { $limit: limit },

      // Project stage: ensure only necessary fields are returned
      {
        $project: {
          password: 0, // remove password field
        },
      },
    ];

    // Get the paginated users
    const users = await this.userModel.aggregate(aggregationPipeline);

    const total = users?.length;

    // Calculate the total number of pages
    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages, page };
  }
}
