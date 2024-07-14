import { IdEntity } from "src/common/interface/id-entity.interface";
import { AcarsEntity } from "./acars.model";

interface ValueCount<T> {
  value: T;
  count: number;
}

export interface GetStatisticsResponse {
  count: number;
  filters: {
    freq: ValueCount<AcarsEntity["freq"]>[];
    label: ValueCount<AcarsEntity["label"]>[];
    regNo: ValueCount<AcarsEntity["regNo"]>[];
    flightNo: ValueCount<AcarsEntity["flightNo"]>[];
    msgNo: ValueCount<AcarsEntity["msgNo"]>[];
    ack: ValueCount<AcarsEntity["ack"]>[];
  };
}

export type GetAcarsMessageElement = AcarsEntity &
  IdEntity & {
    labelDescription: string | null;
    aircraftDescription: string | null;
    airlineDescription: string | null;
  };
