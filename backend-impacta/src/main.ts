import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors(); // Vital para que Vue se pueda conectar sin bloqueos

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Impacta')
    .setDescription('Documentación oficial del backend para la plataforma social Impacta')
    .setVersion('1.0')
    .addBearerAuth() // Preparando el terreno para cuando agreguemos el login
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();