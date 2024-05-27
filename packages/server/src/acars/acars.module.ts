import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Acars } from "./acars.model";
import { AcarsService } from "./acars.service";
import { AcarsController } from "./acars.controller";

@Module({
  imports: [SequelizeModule.forFeature([Acars])],
  providers: [AcarsService],
  controllers: [AcarsController],
})
export class AcarsModule {}
