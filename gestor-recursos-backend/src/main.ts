import './env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT) || 3000;

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Gestor de Recursos Externos')
    .setDescription('API - Belcorp Finance Platform')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-demo-user' }, 'demo-auth')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(port);

  console.log(`🚀 Backend en http://localhost:${port}`);
  console.log(`📚 Swagger en http://localhost:${port}/api/docs`);
}

bootstrap();