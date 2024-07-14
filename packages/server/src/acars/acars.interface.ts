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
    mode: ValueCount<AcarsEntity["mode"]>[];
    label: ValueCount<AcarsEntity["label"]>[];
    subLabel: ValueCount<AcarsEntity["subLabel"]>[];
    blockId: ValueCount<AcarsEntity["blockId"]>[];
    regNo: ValueCount<AcarsEntity["regNo"]>[];
    flightNo: ValueCount<AcarsEntity["flightNo"]>[];
    msgNo: ValueCount<AcarsEntity["msgNo"]>[];
    ack: ValueCount<AcarsEntity["ack"]>[];
    reassemblyStatus: ValueCount<AcarsEntity["reassemblyStatus"]>[];
    libacars: ValueCount<boolean>[];
  };
}

export type GetAcarsMessageElement = AcarsEntity &
  IdEntity & {
    labelDescription: string | null;
    aircraftDescription: string | null;
    airlineDescription: string | null;
  };
