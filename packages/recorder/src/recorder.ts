import * as dgram from "node:dgram";
import { ArgumentParser } from "argparse";
import { addAcars, closeDatabase, openDatabase } from "./recorder.db";
import * as chalk from "chalk";
import { AcarsMessage } from "./recorder.interface";

const DEFAULT_PORT = 16009;

const argParser = new ArgumentParser({
  description: "UDP receiver and sqilte3 recorder for acarsdec",
});

argParser.add_argument("dbFile", {
  help: "Path to sqlite3 database file",
});

argParser.add_argument("-p", "--port", {
  help: `UDP listening port, defaults to ${DEFAULT_PORT}`,
  default: DEFAULT_PORT,
});

const args = argParser.parse_args();

const listenPort = parseInt(args.port) || DEFAULT_PORT;

const db = openDatabase(args.dbFile);

const socket = dgram.createSocket("udp4");

socket.on("message", message => {
  try {
    const acarsMessage: AcarsMessage = JSON.parse(message.toString("utf-8"));
    console.log(chalk.cyanBright("-".repeat(80)));
    console.log(chalk.cyanBright(JSON.stringify(acarsMessage, null, 2)));
    addAcars(db, acarsMessage);
  } catch (e) {
    console.error(e);
  }
});

process.on("SIGINT", () => {
  socket.close();
  closeDatabase(db);
  process.exit(0);
});

socket.bind(listenPort);

console.log(chalk.green(`Started UDP server on port ${listenPort}`));
