import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { AcarsEntity } from "./acars.model";
import { ReassemblyStatus } from "src/common/reassembly";

class StartEndSDto {
  @IsNumberString(
    {},
    {
      message: '"startS" field invalid',
    },
  )
  startS: string;

  @IsNumberString(
    {},
    {
      message: '"endS" field invalid',
    },
  )
  endS: string;
}

export class ExportMessagesDto extends StartEndSDto {
  @IsOptional()
  @IsString({
    message: '"freq" field invalid',
    each: true,
  })
  freq: AcarsEntity["freq"][] | null;

  @IsOptional()
  @IsString({
    message: '"mode" field invalid',
    each: true,
  })
  mode: AcarsEntity["mode"][] | null;

  @IsOptional()
  @IsString({
    message: '"label" field invalid',
    each: true,
  })
  label: AcarsEntity["label"][] | null;

  @IsOptional()
  @IsString({
    message: '"subLabel" field invalid',
    each: true,
  })
  subLabel: AcarsEntity["subLabel"][] | null;

  @IsOptional()
  @IsString({
    message: '"blockId" field invalid',
    each: true,
  })
  blockId: AcarsEntity["blockId"][] | null;

  @IsOptional()
  @IsString({
    message: '"regNo" field invalid',
    each: true,
  })
  regNo: AcarsEntity["regNo"][] | null;

  @IsOptional()
  @IsString({
    message: '"flightNo" field invalid',
    each: true,
  })
  flightNo: AcarsEntity["flightNo"][] | null;

  @IsOptional()
  @IsString({
    message: '"msgNo" field invalid',
    each: true,
  })
  msgNo: AcarsEntity["msgNo"][] | null;

  @IsOptional()
  @IsString({
    message: '"ack" field invalid',
    each: true,
  })
  ack: AcarsEntity["ack"][] | null;

  @IsOptional()
  @IsEnum(ReassemblyStatus, {
    message: '"reassemblyStatus" field invalid',
    each: true,
  })
  reassemblyStatus: AcarsEntity["reassemblyStatus"][] | null;

  @IsOptional()
  @IsBoolean({
    message: '"libacars" field invalid',
    each: true,
  })
  libacars: boolean[] | null;

  @IsOptional()
  @IsString({
    message: '"text" field invalid',
  })
  text: string | null;
}

export class GetMessagesDto extends ExportMessagesDto {
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    {
      message: '"pageIndex" field invalid',
    },
  )
  pageIndex: number;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    {
      message: '"pageSize" field invalid',
    },
  )
  pageSize: number;
}

export class GetStatisticsDto extends StartEndSDto {
  @IsString({
    message: '"text" field invalid',
  })
  text: string;
}
