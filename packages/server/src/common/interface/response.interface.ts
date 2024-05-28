import { StatusCodeType } from "../status-code";

export interface ResponseType<T = null> {
  status: StatusCodeType;
  message?: string;
  data?: T;
}
