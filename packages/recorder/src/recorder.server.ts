import dgram from "node:dgram";
import { ArgumentParser } from "argparse";
import { AcarsMessage } from "./recorder.interface";
import { initializeDatabase, openDatabase } from "./recorder.db";
import chalk from "chalk";

const DEFAULT_PORT = 16009;

const argParser = new ArgumentParser({
  description: "UDP receiver and sqilte3 recorder for acarsdec",
});

argParser.add_argument("dbFile", {
  help: "Path to sqlite3 database file",
});

argParser.add_argument("-i", "--init", {
  action: "store_true",
  help: "Initialize an empty database",
});

argParser.add_argument("-p", "--port", {
  help: "UDP listening port, defaults to 16009",
  default: DEFAULT_PORT,
});

const args = argParser.parse_args();

if (args.init) {
  initializeDatabase(args.dbFile);
  process.exit(0);
}

const listenPort = parseInt(args.port) || DEFAULT_PORT;

const db = openDatabase(args.dbFile);

const socket = dgram.createSocket("udp4");

socket.on("message", message => {
  const acarsMessage: AcarsMessage = JSON.parse(message.toString("utf-8"));
});

socket.bind(listenPort);

console.log(chalk.green(`Started UDP server on port ${listenPort}`));
