import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AcarsModule } from "./acars/acars.module";
import { MessageRecorderModule } from "./message-recorder/message-recorder.module";

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: "sqlite",
      storage: "database/acars.db",
      autoLoadModels: true,
      synchronize: true,
    }),
    AcarsModule,
    MessageRecorderModule,
  ],
})
export class AppModule {}
