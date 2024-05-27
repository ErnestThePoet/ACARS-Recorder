import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Acars } from "src/acars/acars.model";
import { MessageRecorderService } from "./message-recorder.service";

@Module({
  imports: [SequelizeModule.forFeature([Acars])],
  providers: [MessageRecorderService],
})
export class MessageRecorderModule {}
