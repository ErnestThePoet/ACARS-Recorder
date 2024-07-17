import { Dayjs } from "dayjs";

export interface AcarsMessage {
  id: number;
  time: number;
  freq: string;
  level: number;
  error: number;
  mode: string;
  label: string;
  subLabel: string | null;
  blockId: string | null;
  ack: string | null;
  regNo: string | null;
  flightNo: string | null;
  msgNo: string | null;
  reassemblyStatus: number;
  text: string | null;
  libacars: string | null;

  labelDescription: string | null;
  aircraftDescription: string | null;
  airlineDescription: string | null;
}

export interface AcarsMessageFilterType {
  startTime: Dayjs;
  endTime: Dayjs;
  freq: AcarsMessage["freq"][];
  label: AcarsMessage["label"][];
  blockId: AcarsMessage["blockId"][];
  regNo: AcarsMessage["regNo"][];
  flightNo: AcarsMessage["flightNo"][];
  msgNo: AcarsMessage["msgNo"][];
  reassemblyStatus: AcarsMessage["reassemblyStatus"][];
  libacars: boolean[];
  text: string;
}
