export interface AcarsMessage {
  timestamp: number;
  station_id?: string;
  channel: number;
  freq: number;
  level: number;
  error: number;
  mode: string;
  label: string;
  block_id?: string;
  ack: false | string;
  tail?: string;
  flight?: string;
  msgno?: string;
  text?: string;
  end?: true;
  depa?: string;
  dsta?: string;
  eta?: string;
  gtout?: string;
  gtin?: string;
  wloff?: string;
  wlin?: string;
  sublabel?: string;
  mfi?: string;
  assstat?: string;
  libacars?: any;
  app: {
    name: "acarsdec";
    ver: string;
  };
}
