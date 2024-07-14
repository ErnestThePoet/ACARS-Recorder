import { IsNumberString, IsString } from "class-validator";

export class GetAllMessagesInTimeRangeDto {
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

  @IsString({
    message: '"text" field invalid',
  })
  text: string;
}
