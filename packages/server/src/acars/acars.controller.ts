import { Controller } from "@nestjs/common";
import { AcarsService } from "./acars.service";

@Controller("acars")
export class AcarsController {
  constructor(private readonly acarsService: AcarsService) {}
}
