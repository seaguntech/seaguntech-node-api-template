import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';

const createBasicAuthMiddleware = (username: string, password: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="API Docs"');
      res.status(401).send('Authentication required');

      return;
    }

    const encodedCredentials = authorization.slice(6).trim();
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf8');
    const [providedUsername, providedPassword] = decodedCredentials.split(':');

    if (providedUsername !== username || providedPassword !== password) {
      res.setHeader('WWW-Authenticate', 'Basic realm="API Docs"');
      res.status(401).send('Invalid credentials');

      return;
    }

    next();
  };
};

export const setupSwagger = (app: INestApplication, configService: ConfigService) => {
  const docsBasicAuthEnabled = configService.get<boolean>('docs.basicAuthEnabled') ?? false;

  if (docsBasicAuthEnabled) {
    const docsUsername = configService.get<string>('docs.username');
    const docsPassword = configService.get<string>('docs.password');

    if (!docsUsername || !docsPassword) {
      throw new Error(
        'DOCS_USERNAME and DOCS_PASSWORD are required when DOCS_BASIC_AUTH_ENABLED=true',
      );
    }

    const basicAuthMiddleware = createBasicAuthMiddleware(docsUsername, docsPassword);

    app.use('/api/docs', basicAuthMiddleware);
    app.use('/api/docs-json', basicAuthMiddleware);
  }

  const document = createSwaggerDocument(app, configService);

  SwaggerModule.setup('api/docs', app, document);
};

export const createSwaggerDocument = (
  app: INestApplication,
  configService: ConfigService,
): OpenAPIObject => {
  const appDomain = configService.get<string>('app.domain') ?? 'https://seaguntech.com';

  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('SeagunTech Node API Template')
      .setDescription(
        `
## Authentication
- Register: POST /v1/auth/register
- Login: POST /v1/auth/login
- Refresh: POST /v1/auth/refresh
- Logout: POST /v1/auth/logout
- Profile: GET /v1/auth/profile

## Authorization
Use Bearer token in Authorization header

## Pagination
All list endpoints support pagination with page and limit query parameters
      `,
      )
      .setVersion('1.0.0')
      .setContact('SeagunTech', appDomain, 'dev@seaguntech.com')
      .setTermsOfService(`${appDomain}/terms`)
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth()
      .addTag('v1', 'API Version 1 - Current stable version')
      .build(),
  );
};
