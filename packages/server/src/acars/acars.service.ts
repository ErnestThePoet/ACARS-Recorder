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
  GetMessageElement,
  GetMessagesResponse,
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

  private getAcarsModelExportWhere(
    dto: ExportMessagesDto,
  ): WhereOptions<Acars> {
    const queryWhere: WhereOptions<Acars> = {
      time: {
        [Op.gte]: dto.startS,
        [Op.lte]: dto.endS,
      },
    };

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
      const currentFilter = dto[key] as (string | number | null)[];

      if (!currentFilter || currentFilter.length === 0) {
        continue;
      }

      if (currentFilter.includes(null)) {
        queryWhere[key] = {
          [Op.or]: {
            [Op.is]: null,
            [Op.in]: currentFilter.filter(x => x !== null),
          },
        };
      } else {
        queryWhere[key] = {
          [Op.in]: currentFilter,
        };
      }
    }

    if (dto.libacars && dto.libacars.length > 0) {
      if (dto.libacars.every(x => x)) {
        queryWhere.libacars = {
          [Op.not]: null,
        };
      } else if (dto.libacars.every(x => !x)) {
        queryWhere.libacars = {
          [Op.is]: null,
        };
      }
    }

    if (dto.text) {
      queryWhere.text = {
        [Op.substring]: dto.text,
      };
    }

    return queryWhere;
  }

  async getStatistics(
    dto: GetStatisticsDto,
  ): Promise<ResponseType<GetStatisticsResponse>> {
    const queryWhere: WhereOptions<Acars> = {
      time: {
        [Op.gte]: parseFloat(dto.startS),
        [Op.lte]: parseFloat(dto.endS),
      },
    };

    const result: GetStatisticsResponse = {
      filters: {},
    } as GetStatisticsResponse;

    const getFilterField = async (
      key: keyof GetStatisticsResponse["filters"],
    ) => {
      const countField = `${key}Count`;

      if (key === "libacars") {
        result.filters.libacars = [
          {
            value: true,
            // Possibly 0, handle later
            count: await this.acarsModel.count({
              where: {
                ...queryWhere,
                libacars: {
                  [Op.not]: null,
                },
              },
            }),
          },
          {
            value: false,
            // Save one query, compute later
            count: 0,
          },
        ];
      } else {
        result.filters[key] = (
          await this.acarsModel.findAll({
            where: queryWhere,
            attributes: [key, [sequelize.fn("COUNT", "1"), countField]],
            group: [key],
          })
        ).map(x => ({
          value: x[key],
          // extra field cannot be retrieved directly
          count: x.dataValues[countField],
        })) as any;
      }
    };

    await Promise.all([
      getFilterField("freq"),
      // getFilterField("mode"),
      getFilterField("label"),
      // getFilterField("subLabel"),
      getFilterField("blockId"),
      getFilterField("regNo"),
      getFilterField("flightNo"),
      getFilterField("msgNo"),
      // getFilterField("ack"),
      // getFilterField("reassemblyStatus"),
      getFilterField("libacars"),
    ]);

    // Save one dedicated count query
    const totalCount = result.filters.freq.reduce((p, c) => p + c.count, 0);

    if (totalCount === 0) {
      result.filters.libacars = [];
    } else {
      result.filters.libacars[1].count =
        totalCount - result.filters.libacars[0].count;

      if (result.filters.libacars[0].count === 0) {
        result.filters.libacars = [result.filters.libacars[1]];
      } else if (result.filters.libacars[1].count === 0) {
        result.filters.libacars = [result.filters.libacars[0]];
      }
    }

    return successRes(result);
  }

  async getMessages(
    dto: GetMessagesDto,
  ): Promise<ResponseType<GetMessagesResponse>> {
    const result = await this.acarsModel.findAndCountAll({
      where: this.getAcarsModelExportWhere(dto),
      offset: dto.pageIndex * dto.pageSize,
      limit: dto.pageSize,
      order:
        dto.orderBy && dto.orderDirection
          ? [[dto.orderBy, dto.orderDirection]]
          : undefined,
    });

    return successRes({
      totalCount: result.count,
      currentPageMessages: result.rows.map<GetMessageElement>(x => ({
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
    });
  }

  async exportMessages(dto: ExportMessagesDto, res: Response) {
    const startS = dto.startS;
    const endS = dto.endS;

    const result = await this.acarsModel.findAll({
      where: this.getAcarsModelExportWhere(dto),
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
        `ACARS-${formatSTimeyMd(startS, LOCAL_TIMEZONE_OFFSET)}-${formatSTimeyMd(endS, LOCAL_TIMEZONE_OFFSET)}.xlsx`,
    );

    await workbook.xlsx.write(res);

    res.end();
  }
}
