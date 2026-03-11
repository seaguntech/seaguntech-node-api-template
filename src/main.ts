import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, getServerOptions } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { host, port } = getServerOptions(app);

  configureApp(app);

  await app.listen(port, host);
}

void bootstrap();
