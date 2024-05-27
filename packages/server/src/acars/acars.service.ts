import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Acars } from "./acars.model";

@Injectable()
export class AcarsService {
  constructor(@InjectModel(Acars) private acarsModel: typeof Acars) {}
}
