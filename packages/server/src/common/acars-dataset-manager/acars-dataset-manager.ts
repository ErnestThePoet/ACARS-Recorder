import * as fs from "node:fs";
import * as path from "node:path";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AcarsDatasetManager {
  constructor() {
    this.labelMap = new Map();
    this.regNoMap = new Map();
    this.airlineMap = new Map();

    const DATASET_DIR = "datasets";

    const readDatasetLines = filePath => {
      return fs
        .readFileSync(path.join(DATASET_DIR, filePath), {
          encoding: "utf-8",
          flag: "r",
        })
        .split(/\r\n|[\r\n]/)
        .map(x => x.trim())
        .filter(x => x !== "");
    };

    let lines = readDatasetLines("acars_mls.txt");

    for (const line of lines) {
      const split = line.split(",").map(x => x.trim());
      this.labelMap.set(split[0], split[1]);
    }

    lines = readDatasetLines("airlines.txt");

    for (const line of lines) {
      const split = line.split(",").map(x => x.trim());
      this.airlineMap.set(split[0], split[1]);
    }

    lines = readDatasetLines("aircrafts_s.txt");

    for (const line of lines) {
      const split = line.split(",").map(x => x.trim());

      this.regNoMap.set(
        split[0],
        split[2] +
          (this.airlineMap.has(split[1])
            ? ", " + this.airlineMap.get(split[1])
            : ""),
      );
    }

    lines = readDatasetLines("aircrafts_p.txt");

    for (const line of lines) {
      const split = line.split(",").map(x => x.trim());

      if (this.regNoMap.has(split[0])) {
        continue;
      }

      this.regNoMap.set(
        split[0],
        split[3] +
          (this.airlineMap.has(split[6])
            ? ", " + this.airlineMap.get(split[6])
            : ""),
      );
    }
  }

  private labelMap: Map<string, string>;
  private regNoMap: Map<string, string>;
  private airlineMap: Map<string, string>;

  getLabelDescription(label: string) {
    return this.labelMap.has(label) ? this.labelMap.get(label) : null;
  }

  getAircraftDescription(regNo: string) {
    return this.regNoMap.has(regNo) ? this.regNoMap.get(regNo) : null;
  }

  getAirlineDescription(flightNo: string) {
    let airlineCode = null;

    if (flightNo.match(/^[A-Z]{3}/)) {
      airlineCode = flightNo.substring(0, 3);
    } else if (flightNo.match(/^(([A-Z]{2})|(\d[A-Z])|([A-Z]\d))/)) {
      airlineCode = flightNo.substring(0, 2);
    }

    return airlineCode && this.airlineMap.has(airlineCode)
      ? this.airlineMap.get(airlineCode)
      : null;
  }
}
