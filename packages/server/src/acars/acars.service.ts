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
  formatSTimeyMd,
  formatSTimeyMdHms,
} from "src/common/utils/date-time.util";
import { AcarsDatasetManager } from "src/common/acars-dataset-manager/acars-dataset-manager";
import {
  LOCAL_TIMEZONE_NAME,
  LOCAL_TIMEZONE_OFFSET,
} from "src/common/constants";

@Injectable()
export class AcarsService {
  constructor(
    @InjectModel(Acars) private acarsModel: typeof Acars,
    private readonly acarsDatasetManager: AcarsDatasetManager,
  ) {}

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
        reassemblyStatus: x.reassemblyStatus,
        text: x.text,
        libacars: x.libacars,

        labelDescription: this.acarsDatasetManager.getLabelDescription(x.label),
        aircraftDescription:
          x.regNo === null
            ? null
            : this.acarsDatasetManager.getAircraftDescription(x.regNo),
        airlineDescription:
          x.flightNo === null
            ? null
            : this.acarsDatasetManager.getAirlineDescription(x.flightNo),
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
      "UTC",
      LOCAL_TIMEZONE_NAME,
      "Frequency",
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
        formatSTimeyMdHms(x.time),
        formatSTimeyMdHms(x.time, LOCAL_TIMEZONE_OFFSET),
        x.freq,
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
        `${formatSTimeyMd(startS, LOCAL_TIMEZONE_OFFSET)}-${formatSTimeyMd(endS, LOCAL_TIMEZONE_OFFSET)}.xlsx`,
    );

    await workbook.xlsx.write(res);

    res.end();
  }
}
