import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Acars } from "./acars.model";
import { GetAllMessagesInTimeRangeDto } from "./acars.dto";
import { ResponseType } from "src/common/interface/response.interface";
import { GetAcarsMessageElement } from "./acars.interface";
import { successRes } from "src/common/response";
import { Op } from "sequelize";
import { Response } from "express";
import * as ExcelJS from "exceljs";
import {
  formatTimeyMd,
  formatTimeyMdHms,
} from "src/common/utils/date-time.util";

@Injectable()
export class AcarsService {
  constructor(@InjectModel(Acars) private acarsModel: typeof Acars) {}

  async getAllMessagesInTimeRange(
    dto: GetAllMessagesInTimeRangeDto,
  ): Promise<ResponseType<GetAcarsMessageElement[]>> {
    const startS = parseFloat(dto.startS);
    const endS = parseFloat(dto.endS);

    const result = await this.acarsModel.findAll({
      where: {
        time: {
          [Op.gte]: startS,
          [Op.lte]: endS,
        },
      },
    });

    return successRes(
      result.map<GetAcarsMessageElement>(x => ({
        id: x.id,
        time: x.time,
        freq: x.freq,
        channel: x.channel,
        level: x.level,
        error: x.error,
        mode: x.mode,
        label: x.label,
        subLabel: x.subLabel,
        blockId: x.blockId,
        ack: x.ack,
        regNo: x.regNo,
        flightNo: x.flightNo,
        msgNo: x.msgNo,
        text: x.text,
        libacars: x.libacars,
      })),
    );
  }

  async exportAllMessagesInTimeRange(
    dto: GetAllMessagesInTimeRangeDto,
    res: Response,
  ) {
    const startS = parseFloat(dto.startS);
    const endS = parseFloat(dto.endS);

    const result = await this.acarsModel.findAll({
      where: {
        time: {
          [Op.gte]: startS,
          [Op.lte]: endS,
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ACARS");

    sheet.addRow([
      "UTC Time",
      "CST Time",
      "Frequency",
      "Channel",
      "Level",
      "Error",
      "Mode",
      "Label",
      "Sublabel",
      "Block ID",
      "Ack",
      "Reg No",
      "Flight No",
      "Message No",
      "Text",
      "libacars",
    ]);

    sheet.addRows(
      result.map(x => [
        formatTimeyMdHms(x.time, "+00:00"),
        formatTimeyMdHms(x.time, "+08:00"),
        x.freq,
        x.channel,
        x.level,
        x.error,
        x.mode,
        x.label,
        x.subLabel ?? "",
        x.blockId ?? "",
        x.ack ?? "NACK",
        x.regNo ?? "",
        x.flightNo ?? "",
        x.msgNo ?? "",
        x.text ?? "",
        x.libacars ?? "",
      ]),
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" +
        `${formatTimeyMd(startS, "+08:00")}-${formatTimeyMd(endS, "+08:00")}.xlsx`,
    );

    await workbook.xlsx.write(res);

    res.end();
  }
}
