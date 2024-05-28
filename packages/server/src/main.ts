import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception-filter";

async function bootstrap() {
  const app = (await NestFactory.create<NestExpressApplication>(AppModule))
    .setGlobalPrefix("api")
    .useGlobalPipes(new ValidationPipe())
    .useGlobalFilters(new HttpExceptionFilter());

  app.set("trust proxy", "loopback");
  // TODO disable cors
  app.enableCors();

  await app.listen(16010);
}

bootstrap();
