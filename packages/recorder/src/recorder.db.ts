import * as fs from "node:fs";
import * as sqlite3 from "better-sqlite3";
import * as chalk from "chalk";
import { AcarsMessage } from "./recorder.interface";

export function openDatabase(path: string): sqlite3.Database {
  if (!fs.existsSync(path)) {
    console.log(chalk.red(`Cannot find database file "${path}"`));
    process.exit(1);
  }

  return sqlite3(path);
}

export function addAcars(db: sqlite3.Database, acarsMessage: AcarsMessage) {
  const statement = db.prepare(
    `INSERT INTO acars VALUES (${new Array(15).fill("?").join(",")})`,
  );

  const insertOne = db.transaction((msg: AcarsMessage) => {
    statement.run(
      msg.timestamp,
      msg.freq.toFixed(3),
      msg.channel,
      msg.level,
      msg.error,
      msg.mode,
      msg.label,
      msg.sublabel ?? null,
      msg.block_id ?? null,
      msg.ack === false ? null : msg.ack,
      msg.tail ?? null,
      msg.flight ?? null,
      msg.msgno ?? null,
      msg.text ?? null,
      msg.libacars ? JSON.stringify(msg.libacars) : null,
    );
  });

  insertOne(acarsMessage);
}

export function closeDatabase(db: sqlite3.Database) {
  db.close();
}
