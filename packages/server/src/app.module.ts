import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AcarsModule } from "./acars/acars.module";

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: "sqlite",
      storage: "acars.db",
    }),
    AcarsModule,
  ],
})
export class AppModule {}
