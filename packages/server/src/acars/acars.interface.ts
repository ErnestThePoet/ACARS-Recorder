import { IdEntity } from "src/common/interface/id-entity.interface";
import { AcarsEntity } from "./acars.model";

export type GetAcarsMessageElement = AcarsEntity &
  IdEntity & {
    labelDescription: string | null;
    aircraftDescription: string | null;
    airlineDescription: string | null;
  };
