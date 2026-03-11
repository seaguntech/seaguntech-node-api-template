import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { createSwaggerDocument } from '../src/infrastructure/docs/swagger';

const outputPath = resolve(process.cwd(), 'openapi/openapi.json');

const exportOpenApi = async () => {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const configService = app.get(ConfigService);
  const document = createSwaggerDocument(app, configService);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(document, null, 2), 'utf8');

  execSync('prettier --write openapi/openapi.json', { stdio: 'inherit' });

  await app.close();
};

void exportOpenApi();
