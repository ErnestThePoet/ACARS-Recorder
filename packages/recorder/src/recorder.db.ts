import * as fs from "node:fs";
import { Database, verbose as sqlite3Verbose } from "sqlite3";
import * as chalk from "chalk";
import { AcarsMessage } from "./recorder.interface";

const sqlite3 = sqlite3Verbose();

function Q(value: string | number) {
  return `"${value}"`;
}

export function initializeDatabase(path: string) {
  if (fs.existsSync(path)) {
    console.log(
      chalk.yellow(
        `Database file "${path}" already exists. Please use another file name.`,
      ),
    );
    process.exit(1);
  }

  const db = new sqlite3.Database(path);

  db.run(
    "CREATE TABLE acars (id INTEGER PRIMARY KEY AUTO_INCREMENT, time REAL, freq TEXT, mode TEXT, label TEXT, block_id TEXT, reg_no TEXT, filght_no TEXT, msg_no TEXT, text TEXT, remark TEXT)",
  );

  db.close();
}

export function openDatabase(path: string) {
  if (!fs.existsSync(path)) {
    console.log(chalk.red(`Cannot find database file "${path}"`));
    process.exit(1);
  }

  return new sqlite3.Database(path);
}

export function addAcars(db: Database, acars: AcarsMessage) {
  db.serialize(() => {
    const statement = db.prepare("INSERT INTO acars VALUES (?)");
    statement.run(
      [
        acars.timestamp,
        Q(acars.freq.toFixed(3)),
        Q(acars.mode),
        Q(acars.label),
        Q(acars.block_id ?? ""),
        Q(acars.tail ?? ""),
        Q(acars.flight ?? ""),
        Q(acars.msgno ?? ""),
        Q(acars.text ?? ""),
        Q(""),
      ].join(","),
    );
    statement.finalize();
  });
}

export function closeDatabase(db: Database) {
  db.close();
}
