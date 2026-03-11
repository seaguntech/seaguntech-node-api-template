import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { setupSwagger } from './infrastructure/docs/swagger';

export const configureApp = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('app.domain'),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupSwagger(app, configService);
};

export const getServerOptions = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  return {
    port: configService.get<number>('app.port') ?? 3000,
    host: configService.get<string>('app.host') ?? '0.0.0.0',
  };
};
