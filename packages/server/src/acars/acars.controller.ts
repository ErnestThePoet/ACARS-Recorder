import { Controller, Get, Query, Res } from "@nestjs/common";
import { AcarsService } from "./acars.service";
import { GetAllMessagesInTimeRangeDto } from "./acars.dto";
import { Response } from "express";

@Controller("acars")
export class AcarsController {
  constructor(private readonly acarsService: AcarsService) {}

  @Get("messages_in_time_range")
  getAllMessagesInTimeRange(@Query() dto: GetAllMessagesInTimeRangeDto) {
    return this.acarsService.getAllMessagesInTimeRange(dto);
  }

  @Get("export_messages_in_time_range")
  exportAllMessagesInTimeRange(
    @Query() dto: GetAllMessagesInTimeRangeDto,
    @Res() res: Response,
  ) {
    this.acarsService.exportAllMessagesInTimeRange(dto, res);
  }
}
