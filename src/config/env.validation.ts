import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsString()
  HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  PORT!: number;

  @IsString()
  APP_NAME!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_URL!: string;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_TTL!: string;

  @IsString()
  JWT_REFRESH_TTL!: string;

  @IsOptional()
  @IsString()
  DOCS_USERNAME?: string;

  @IsOptional()
  @IsString()
  DOCS_PASSWORD?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  DOCS_BASIC_AUTH_ENABLED?: string;
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
