import { Controller, Get, Query, Res } from "@nestjs/common";
import { AcarsService } from "./acars.service";
import { GetMessagesDto } from "./acars.dto";
import { Response } from "express";

@Controller("acars")
export class AcarsController {
  constructor(private readonly acarsService: AcarsService) {}

  @Get("messages_in_time_range")
  getMessages(@Query() dto: GetMessagesDto) {
    return this.acarsService.getMessages(dto);
  }

  @Get("export_messages_in_time_range")
  exportMessages(@Query() dto: GetMessagesDto, @Res() res: Response) {
    this.acarsService.exportMessages(dto, res);
  }
}
