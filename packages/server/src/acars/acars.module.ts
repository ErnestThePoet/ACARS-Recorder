import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Acars } from "./acars.model";
import { AcarsService } from "./acars.service";
import { AcarsController } from "./acars.controller";
import { AcarsDatasetManager } from "src/common/acars-dataset-manager/acars-dataset-manager";

@Module({
  imports: [SequelizeModule.forFeature([Acars])],
  providers: [AcarsService, AcarsDatasetManager],
  controllers: [AcarsController],
})
export class AcarsModule {}
