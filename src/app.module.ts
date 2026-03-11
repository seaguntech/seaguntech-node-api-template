import { Module } from '@nestjs/common';
import { AuthCoreModule } from './common/auth/auth.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { RedisModule } from './infrastructure/cache/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { SystemModule } from './modules/system/system.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    SystemModule,
    AuthCoreModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    RedisModule,
  ],
})
export class AppModule {}
