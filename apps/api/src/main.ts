import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvVars } from './config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<EnvVars, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // unknown query params -> 400 instead of being silently ignored
      transform: true,
    }),
  );
  app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }) });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pilot Compliance API')
    .setDescription('Documents expiry, monthly duty schedule and flight time limitations. "Today" comes from APP_TODAY.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  new Logger('Bootstrap').log(
    `API on http://localhost:${port}/api (docs: /api/docs, today=${config.get('APP_TODAY', { infer: true })})`,
  );
}

void bootstrap();
