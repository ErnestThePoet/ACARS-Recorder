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
  freq: AcarsMessage["freq"][] | null;
  mode: AcarsMessage["mode"][] | null;
  label: AcarsMessage["label"][] | null;
  subLabel: AcarsMessage["subLabel"][] | null;
  blockId: AcarsMessage["blockId"][] | null;
  regNo: AcarsMessage["regNo"][] | null;
  flightNo: AcarsMessage["flightNo"][] | null;
  msgNo: AcarsMessage["msgNo"][] | null;
  ack: AcarsMessage["ack"][] | null;
  reassemblyStatus: AcarsMessage["reassemblyStatus"][] | null;
  libacars: boolean[] | null;
  text: string | null;
}
