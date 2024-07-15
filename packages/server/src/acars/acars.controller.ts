import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
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

  @Post("get_messages")
  getMessages(@Body() dto: GetMessagesDto) {
    return this.acarsService.getMessages(dto);
  }

  @Post("export_messages")
  exportMessages(@Body() dto: ExportMessagesDto, @Res() res: Response) {
    this.acarsService.exportMessages(dto, res);
  }
}
