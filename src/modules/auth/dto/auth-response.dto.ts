import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken!: string;
}

export class AuthUserDto {
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
}

export class AuthDataDto {
  @ApiProperty({ type: () => AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: () => AuthTokensDto })
  tokens!: AuthTokensDto;
}

export class AuthResponseDto {
  @ApiProperty({
    type: String,
    example: 'Login successfully.',
    description: 'Response message',
  })
  message!: string;

  @ApiProperty({ type: () => AuthDataDto })
  data!: AuthDataDto;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken!: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    type: String,
    example: 'Logout successfully.',
    description: 'Response message',
  })
  message!: string;
}
