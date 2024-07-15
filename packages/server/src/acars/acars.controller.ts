import { Controller, Get, Query, Res } from "@nestjs/common";
import { AcarsService } from "./acars.service";
import {
  ExportMessagesDto,
  GetMessagesDto,
  GetStatisticsDto,
} from "./acars.dto";
import { Response } from "express";

@Controller("acars")
export class AcarsController {
  constructor(private readonly acarsService: AcarsService) {}

  @Get("get_statistics")
  getStatistics(@Query() dto: GetStatisticsDto) {
    return this.acarsService.getStatistics(dto);
  }

  @Get("get_messages")
  getMessages(@Query() dto: GetMessagesDto) {
    return this.acarsService.getMessages(dto);
  }

  @Get("export_messages")
  exportMessages(@Query() dto: ExportMessagesDto, @Res() res: Response) {
    this.acarsService.exportMessages(dto, res);
  }
}
