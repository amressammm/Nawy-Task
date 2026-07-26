import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // The frontend calls this API server-side, so CORS isn't strictly needed —
  // it's enabled so the API can also be exercised straight from a browser.
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // drop properties the DTO doesn't declare
      forbidNonWhitelisted: true, // ...and reject the request outright if any were sent
      transform: true, // apply the DTOs' declared types and defaults
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nawy Apartments API')
    .setDescription('List, search, view, and create apartment listings.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  // Without this, SIGTERM is ignored: every `docker compose down` waits out
  // the full grace period and is then killed, dropping in-flight requests.
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4000);
  // 0.0.0.0 rather than localhost, so the port is reachable from outside the container.
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
