import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/auth/access-token.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiCreatedResponse({ type: UserResponseDto, description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiOkResponse({ type: [UserResponseDto], description: 'Users retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  listUsers(@Query() query: QueryUsersDto) {
    return this.usersService.listUsers(query);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getUser(@Param('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  updateUser(@Param('userId') userId: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(userId, body);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user' })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('userId') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
