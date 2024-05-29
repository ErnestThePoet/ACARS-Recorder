import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function formatTimeyMdHms(timeMs: number, timeZone: string) {
  return format(toZonedTime(timeMs, timeZone), "yyyy/MM/dd HH:mm:ss");
}

export function formatTimeHms(timeMs: number, timeZone: string) {
  return format(toZonedTime(timeMs, timeZone), "HH:mm:ss");
}
