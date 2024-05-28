import { IdEntity } from "src/common/interface/id-entity.interface";
import { AcarsEntity } from "./acars.model";

export type GetAcarsMessageElement = AcarsEntity & IdEntity;
