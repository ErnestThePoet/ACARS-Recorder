import dayjs, { Dayjs } from "dayjs";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const MS_PER_SEC = 1000;

export function formatMsTimeyMdHms(timeMs: number, timeZone?: string) {
  return format(
    toZonedTime(timeMs, timeZone ?? "+00:00"),
    "yyyy/MM/dd HH:mm:ss",
  );
}

export function formatMsTimeHms(timeMs: number, timeZone?: string) {
  return format(toZonedTime(timeMs, timeZone ?? "+00:00"), "HH:mm:ss");
}

export function formatSTimeyMdHms(timeS: number, timeZone?: string) {
  return formatMsTimeyMdHms(timeS * MS_PER_SEC, timeZone);
}

export function formatSTimeHms(timeS: number, timeZone?: string) {
  return formatMsTimeHms(timeS * MS_PER_SEC, timeZone);
}

export function getTodayTimeRange(): [Dayjs, Dayjs] {
  const now = new Date();
  return [
    dayjs(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    ),
    dayjs(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ),
    ),
  ];
}
