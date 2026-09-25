import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar límites de payload para archivos grandes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Servir archivos estáticos desde el directorio de uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Endpoint liviano para health checks de Coolify y del proxy.
  app.getHttpAdapter().get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
  
  // Configurar CORS
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL?.split(',').map((origin) => origin.trim()) ?? []),
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Configurar prefijo global para las APIs
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT || 3001;
  await app.listen(port,'0.0.0.0');
  
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`API disponible en http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('Error iniciando la aplicación:', error);
  process.exit(1);
});