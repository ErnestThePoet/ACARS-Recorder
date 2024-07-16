import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { AcarsEntity } from "./acars.model";
import { OrderDirection } from "src/common/order-direction";

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

  @IsString({
    message: '"text" field invalid',
  })
  text: string;

  @IsArray({
    message: '"freq" field invalid',
  })
  @IsString({
    message: '"freq" field invalid',
    each: true,
  })
  freq: AcarsEntity["freq"][];

  // @IsArray({
  //   message: '"mode" field invalid',
  // })
  // @IsString({
  //   message: '"mode" field invalid',
  //   each: true,
  // })
  // mode: AcarsEntity["mode"][];

  @IsArray({
    message: '"label" field invalid',
  })
  @IsString({
    message: '"label" field invalid',
    each: true,
  })
  label: AcarsEntity["label"][];

  // @IsArray({
  //   message: '"subLabel" field invalid',
  // })
  // @IsString({
  //   message: '"subLabel" field invalid',
  //   each: true,
  // })
  // subLabel: AcarsEntity["subLabel"][];

  @IsArray({
    message: '"blockId" field invalid',
  })
  blockId: AcarsEntity["blockId"][];

  @IsArray({
    message: '"regNo" field invalid',
  })
  regNo: AcarsEntity["regNo"][];

  @IsArray({
    message: '"flightNo" field invalid',
  })
  flightNo: AcarsEntity["flightNo"][];

  @IsArray({
    message: '"msgNo" field invalid',
  })
  msgNo: AcarsEntity["msgNo"][];

  // @IsArray({
  //   message: '"ack" field invalid',
  // })
  // @IsString({
  //   message: '"ack" field invalid',
  //   each: true,
  // })
  // ack: AcarsEntity["ack"][];

  // @IsArray({
  //   message: '"reassemblyStatus" field invalid',
  // })
  // @IsEnum(ReassemblyStatus, {
  //   message: '"reassemblyStatus" field invalid',
  //   each: true,
  // })
  // reassemblyStatus: AcarsEntity["reassemblyStatus"][];

  @IsArray({
    message: '"libacars" field invalid',
  })
  @IsBoolean({
    message: '"libacars" field invalid',
    each: true,
  })
  libacars: boolean[];
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

  @IsOptional()
  @IsString({
    message: '"orderBy" field invalid',
  })
  orderBy: string | null;

  @IsOptional()
  @IsEnum(OrderDirection, {
    message: '"orderDirection" field invalid',
  })
  orderDirection: OrderDirection | null;
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
}
