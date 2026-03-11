import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/auth/access-token.guard';
import type { AuthUser } from '../../common/auth/auth-user.type';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'User registered successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Email already exists' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Login successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: AuthTokensDto, description: 'Tokens refreshed successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiNoContentResponse({ description: 'Logout successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Profile retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AccessTokenGuard)
  profile(@CurrentUser() user: AuthUser) {
    return this.authService.profile(user);
  }
}
