import * as fs from "node:fs";
import * as sqlite3 from "better-sqlite3";
import * as chalk from "chalk";
import { AcarsMessage } from "./recorder.interface";

export function initializeDatabase(path: string) {
  if (fs.existsSync(path)) {
    console.log(
      chalk.yellow(
        `Database file "${path}" already exists. Please use another file name.`,
      ),
    );
    process.exit(1);
  }

  const db = sqlite3(path);

  db.exec(
    "CREATE TABLE acars (time REAL, freq TEXT, mode TEXT, label TEXT, block_id TEXT, reg_no TEXT, filght_no TEXT, msg_no TEXT, text TEXT, remark TEXT)",
  );

  db.close();

  console.log(
    chalk.green(`Successfully created empty database file "${path}"`),
  );
}

export function openDatabase(path: string): sqlite3.Database {
  if (!fs.existsSync(path)) {
    console.log(chalk.red(`Cannot find database file "${path}"`));
    process.exit(1);
  }

  return sqlite3(path);
}

export function addAcars(db: sqlite3.Database, acarsMessage: AcarsMessage) {
  const statement = db.prepare(
    "INSERT INTO acars VALUES (?,?,?,?,?,?,?,?,?,?)",
  );

  const insertOne = db.transaction((msg: AcarsMessage) => {
    statement.run(
      msg.timestamp,
      msg.freq.toFixed(3),
      msg.mode,
      msg.label,
      msg.block_id ?? "",
      msg.tail ?? "",
      msg.flight ?? "",
      msg.msgno ?? "",
      msg.text ?? "",
      "",
    );
  });

  insertOne(acarsMessage);
}

export function closeDatabase(db: sqlite3.Database) {
  db.close();
}
