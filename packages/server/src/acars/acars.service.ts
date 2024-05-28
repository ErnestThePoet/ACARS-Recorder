import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Acars } from "./acars.model";
import { GetAllMessagesInTimeRangeDto } from "./acars.dto";
import { ResponseType } from "src/common/interface/response.interface";
import { GetAcarsMessageElement } from "./acars.interface";
import { successRes } from "src/common/response";
import { Op } from "sequelize";

@Injectable()
export class AcarsService {
  constructor(@InjectModel(Acars) private acarsModel: typeof Acars) {}

  async getAllMessagesInTimeRange(
    dto: GetAllMessagesInTimeRangeDto,
  ): Promise<ResponseType<GetAcarsMessageElement[]>> {
    const result = await this.acarsModel.findAll({
      where: {
        time: {
          [Op.gte]: parseFloat(dto.start),
          [Op.lte]: parseFloat(dto.end),
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
}
