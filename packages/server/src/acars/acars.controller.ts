import { Controller, Get, Query } from "@nestjs/common";
import { AcarsService } from "./acars.service";
import { GetAllMessagesInTimeRangeDto } from "./acars.dto";

@Controller("acars")
export class AcarsController {
  constructor(private readonly acarsService: AcarsService) {}

  @Get("messages_in_time_range")
  getAllMessagesInTimeRange(@Query() dto: GetAllMessagesInTimeRangeDto) {
    return this.acarsService.getAllMessagesInTimeRange(dto);
  }
}
