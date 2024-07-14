import { StatusCode } from "../status-code";

export interface ResponseType<T = null> {
  status: StatusCode;
  message?: string;
  data?: T;
}
