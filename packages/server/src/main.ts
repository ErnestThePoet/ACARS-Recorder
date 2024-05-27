import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = (
    await NestFactory.create<NestExpressApplication>(AppModule)
  ).setGlobalPrefix("api");

  app.set("trust proxy", "loopback");
  // TODO disable cors
  app.enableCors();

  await app.listen(16010);
}

bootstrap();
