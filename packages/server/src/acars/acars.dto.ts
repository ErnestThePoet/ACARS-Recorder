import { IsNumberString } from "class-validator";

export class GetAllMessagesInTimeRangeDto {
  @IsNumberString(null, {
    message: '"start" field invalid',
  })
  start: string;

  @IsNumberString(null, {
    message: '"end" field invalid',
  })
  end: string;
}
