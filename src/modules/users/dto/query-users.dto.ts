import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    minimum: 1,
    default: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 20, max: 100)',
    minimum: 1,
    maximum: 100,
    default: 20,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'updatedAt', 'email'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'email'])
  sortBy?: 'createdAt' | 'updatedAt' | 'email';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
