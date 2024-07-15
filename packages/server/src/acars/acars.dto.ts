import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { AcarsEntity } from "./acars.model";

export class ExportMessagesDto {
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    {
      message: '"startS" field invalid',
    },
  )
  startS: number;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    {
      message: '"endS" field invalid',
    },
  )
  endS: number;

  @IsOptional()
  @IsString({
    message: '"text" field invalid',
  })
  text: string | null;

  @IsOptional()
  @IsArray({
    message: '"freq" field invalid',
  })
  @IsString({
    message: '"freq" field invalid',
    each: true,
  })
  freq: AcarsEntity["freq"][] | null;

  // @IsOptional()
  // @IsArray({
  //   message: '"mode" field invalid',
  // })
  // @IsString({
  //   message: '"mode" field invalid',
  //   each: true,
  // })
  // mode: AcarsEntity["mode"][] | null;

  @IsOptional()
  @IsArray({
    message: '"label" field invalid',
  })
  @IsString({
    message: '"label" field invalid',
    each: true,
  })
  label: AcarsEntity["label"][] | null;

  // @IsOptional()
  // @IsArray({
  //   message: '"subLabel" field invalid',
  // })
  // @IsString({
  //   message: '"subLabel" field invalid',
  //   each: true,
  // })
  // subLabel: AcarsEntity["subLabel"][] | null;

  @IsOptional()
  @IsArray({
    message: '"blockId" field invalid',
  })
  @IsString({
    message: '"blockId" field invalid',
    each: true,
  })
  blockId: AcarsEntity["blockId"][] | null;

  @IsOptional()
  @IsArray({
    message: '"regNo" field invalid',
  })
  @IsString({
    message: '"regNo" field invalid',
    each: true,
  })
  regNo: AcarsEntity["regNo"][] | null;

  @IsOptional()
  @IsArray({
    message: '"flightNo" field invalid',
  })
  @IsString({
    message: '"flightNo" field invalid',
    each: true,
  })
  flightNo: AcarsEntity["flightNo"][] | null;

  @IsOptional()
  @IsArray({
    message: '"msgNo" field invalid',
  })
  @IsString({
    message: '"msgNo" field invalid',
    each: true,
  })
  msgNo: AcarsEntity["msgNo"][] | null;

  // @IsOptional()
  // @IsArray({
  //   message: '"ack" field invalid',
  // })
  // @IsString({
  //   message: '"ack" field invalid',
  //   each: true,
  // })
  // ack: AcarsEntity["ack"][] | null;

  // @IsOptional()
  // @IsArray({
  //   message: '"reassemblyStatus" field invalid',
  // })
  // @IsEnum(ReassemblyStatus, {
  //   message: '"reassemblyStatus" field invalid',
  //   each: true,
  // })
  // reassemblyStatus: AcarsEntity["reassemblyStatus"][] | null;

  @IsOptional()
  @IsArray({
    message: '"libacars" field invalid',
  })
  @IsBoolean({
    message: '"libacars" field invalid',
    each: true,
  })
  libacars: boolean[] | null;
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

export class GetStatisticsDto {
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

  @IsOptional()
  @IsString({
    message: '"text" field invalid',
  })
  text: string | null;
}
