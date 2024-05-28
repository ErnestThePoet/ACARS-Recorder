import { ResponseType } from "./interface/response.interface";
import { StatusCode } from "./status-code";

export function successRes<T = null>(data?: T): ResponseType<T> {
  return {
    status: StatusCode.SUCCESS,
    data,
  };
}

export function warningRes<T = null>(
  message: string,
  data?: T,
): ResponseType<T> {
  return {
    status: StatusCode.WARNING,
    message,
    data,
  };
}

export function errorRes<T = null>(message: string, data?: T): ResponseType<T> {
  return {
    status: StatusCode.ERROR,
    message,
    data,
  };
}
