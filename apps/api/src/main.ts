import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { TenantGuard } from './common/guards/tenant.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Apply TenantGuard globally - REMOVED because it runs before AuthGuard
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new TenantGuard(reflector));

  // Enable CORS for frontend
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
