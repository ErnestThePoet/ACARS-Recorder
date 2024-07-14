import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const S_PER_MINUTE = 60;

export const MS_PER_SEC = 1000;
export const MS_PER_MINUTE = MS_PER_SEC * S_PER_MINUTE;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;

export function getNow(): number {
  return new Date().getTime();
}

export function formatSTimeyMdHms(timeS: number, timeZone?: string) {
  return format(
    toZonedTime(timeS * MS_PER_SEC, timeZone ?? "+00:00"),
    "yyyy/MM/dd HH:mm:ss",
  );
}

export function formatSTimeyMd(timeS: number, timeZone?: string) {
  return format(
    toZonedTime(timeS * MS_PER_SEC, timeZone ?? "+00:00"),
    "yyyyMMdd",
  );
}
