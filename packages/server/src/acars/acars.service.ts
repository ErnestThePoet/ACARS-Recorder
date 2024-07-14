import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Acars } from "./acars.model";
import {
  ExportMessagesDto,
  GetMessagesDto,
  GetStatisticsDto,
} from "./acars.dto";
import { ResponseType } from "src/common/interface/response.interface";
import {
  GetAcarsMessageElement,
  GetStatisticsResponse,
} from "./acars.interface";
import { successRes } from "src/common/response";
import { Op, WhereOptions } from "sequelize";
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
import { getReassemblyStatusString } from "src/common/reassembly";
import sequelize from "sequelize";

@Injectable()
export class AcarsService {
  constructor(
    @InjectModel(Acars) private acarsModel: typeof Acars,
    private readonly acarsDatasetManager: AcarsDatasetManager,
  ) {}

  private getAcarsModelWhere(dto: ExportMessagesDto): WhereOptions<Acars> {
    const conditions: any[] = [
      {
        time: {
          [Op.gte]: parseFloat(dto.startS),
          [Op.lte]: parseFloat(dto.endS),
        },
      },
    ];

    for (const key of [
      "freq",
      "mode",
      "label",
      "subLabel",
      "blockId",
      "regNo",
      "flightNo",
      "msgNo",
      "ack",
      "reassemblyStatus",
    ]) {
      if (!dto[key]) {
        continue;
      }

      const currentFilter = dto[key] as (string | number | null)[];

      if (currentFilter.includes(null)) {
        conditions.push({
          [key]: {
            [Op.or]: {
              [Op.is]: null,
              [Op.in]: currentFilter.filter(x => x !== null),
            },
          },
        });
      } else {
        conditions.push({
          [key]: {
            [Op.in]: currentFilter,
          },
        });
      }
    }

    if (dto.libacars && dto.libacars.length > 0) {
      if (dto.libacars.every(x => x)) {
        conditions.push({
          libacars: {
            [Op.not]: null,
          },
        });
      } else if (dto.libacars.every(x => !x)) {
        conditions.push({
          libacars: {
            [Op.is]: null,
          },
        });
      }
    }

    if (dto.text) {
      conditions.push(
        sequelize.where(sequelize.fn("UPPER", sequelize.col("text")), {
          [Op.substring]: dto.text.toUpperCase(),
        }),
      );
    }

    return {
      [Op.and]: conditions,
    };
  }

  async getStatistics(
    dto: GetStatisticsDto,
  ): Promise<ResponseType<GetStatisticsResponse>> {}

  async getMessages(
    dto: GetMessagesDto,
  ): Promise<ResponseType<GetAcarsMessageElement[]>> {
    const result = await this.acarsModel.findAll({
      where: this.getAcarsModelWhere(dto),
      offset: dto.pageIndex * dto.pageSize,
      limit: dto.pageSize,
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

  async exportMessages(dto: ExportMessagesDto, res: Response) {
    const startS = parseFloat(dto.startS);
    const endS = parseFloat(dto.endS);

    const result = await this.acarsModel.findAll({
      where: this.getAcarsModelWhere(dto),
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ACARS");

    sheet.addRow([
      "Text",
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
      "Reassembly",
      "libacars",
    ]);

    sheet.addRows(
      result.map(x => [
        x.text ?? "",
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
        getReassemblyStatusString(x.reassemblyStatus),
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
