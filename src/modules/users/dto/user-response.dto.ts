import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier',
  })
  id!: string;

  @ApiProperty({
    type: String,
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({
    type: Date,
    example: '2024-01-01T00:00:00.000Z',
    description: 'User creation timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    type: Date,
    example: '2024-01-01T00:00:00.000Z',
    description: 'User last update timestamp',
  })
  updatedAt!: Date;
}
