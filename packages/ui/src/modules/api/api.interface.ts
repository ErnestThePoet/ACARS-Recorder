import { AcarsMessage } from "../interface/acars.interface";
import { OrderDirection } from "../order-direction";
import { StatusCode } from "./api";

export interface ResponseType<T = null> {
  status: StatusCode;
  message?: string;
  data?: T;
}

export interface GetStatisticsDto {
  startS: number;
  endS: number;
}

export interface ExportMessagesDto {
  startS: number;
  endS: number;
  text: string;
  freq: AcarsMessage["freq"][];
  label: AcarsMessage["label"][];
  blockId: AcarsMessage["blockId"][];
  regNo: AcarsMessage["regNo"][];
  flightNo: AcarsMessage["flightNo"][];
  msgNo: AcarsMessage["msgNo"][];
  reassemblyStatus: AcarsMessage["reassemblyStatus"][];
  libacars: boolean[];
}

export type GetMessagesDto = ExportMessagesDto & {
  pageIndex: number;
  pageSize: number;
  orderBy: string | null;
  orderDirection: OrderDirection | null;
};

interface ValueCount<T> {
  value: T;
  count: number;
}

export interface GetStatisticsFilters {
  freq: ValueCount<AcarsMessage["freq"]>[];
  label: ValueCount<AcarsMessage["label"]>[];
  blockId: ValueCount<AcarsMessage["blockId"]>[];
  regNo: ValueCount<AcarsMessage["regNo"]>[];
  flightNo: ValueCount<AcarsMessage["flightNo"]>[];
  msgNo: ValueCount<AcarsMessage["msgNo"]>[];
  reassemblyStatus: ValueCount<AcarsMessage["reassemblyStatus"]>[];
  libacars: ValueCount<boolean>[];
}

export type GetStatisticsResponse = ResponseType<{
  filters: GetStatisticsFilters;
}>;

export type GetMessagesResponse = ResponseType<{
  totalCount: number;
  currentPageMessages: AcarsMessage[];
}>;
