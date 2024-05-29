import { IsNumberString } from "class-validator";

export class GetAllMessagesInTimeRangeDto {
  @IsNumberString(null, {
    message: '"startS" field invalid',
  })
  startS: string;

  @IsNumberString(null, {
    message: '"endS" field invalid',
  })
  endS: string;
}
