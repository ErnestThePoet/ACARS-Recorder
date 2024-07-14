import * as dgram from "node:dgram";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Acars } from "src/acars/acars.model";
import * as chalk from "chalk";
import { AcarsMessage } from "./message-recorder.interface";
import { getReassemblyStatus } from "src/common/reassembly";

@Injectable()
export class MessageRecorderService {
  constructor(@InjectModel(Acars) private acarsModel: typeof Acars) {
    this.socket = dgram.createSocket("udp4");
    /* eslint-disable no-console */
    this.socket.on("message", async message => {
      try {
        const acarsMessage: AcarsMessage = JSON.parse(
          message.toString("utf-8"),
        );

        // Skip link test messages
        if (acarsMessage.label === "_d" || acarsMessage.label === "Q0") {
          return;
        }

        console.log(chalk.cyanBright("-".repeat(80)));
        console.log(chalk.cyanBright(JSON.stringify(acarsMessage, null, 2)));

        const reassemblyStatus = getReassemblyStatus(
          acarsMessage.assstat ?? null,
        );

        await this.acarsModel.create({
          time: acarsMessage.timestamp,
          freq: acarsMessage.freq.toFixed(3),
          level: acarsMessage.level,
          error: acarsMessage.error,
          mode: acarsMessage.mode,
          label: acarsMessage.label,
          subLabel: acarsMessage.sublabel ?? null,
          blockId: acarsMessage.block_id ?? null,
          ack: acarsMessage.ack === false ? null : acarsMessage.ack,
          regNo: acarsMessage.tail ?? null,
          flightNo: acarsMessage.flight ?? null,
          msgNo: acarsMessage.msgno ?? null,
          reassemblyStatus,
          text: acarsMessage.text ?? null,
          libacars: acarsMessage.libacars
            ? JSON.stringify(acarsMessage.libacars)
            : null,
        });

        // TODO Delete previous incomplete message parts
      } catch (e) {
        console.error(e);
      }
    });
    /* eslint-enable no-console */

    this.socket.bind(16009);
  }

  private socket: dgram.Socket;
}
