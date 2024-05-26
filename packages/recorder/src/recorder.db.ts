import fs from "node:fs";
import { Database, verbose as sqlite3Verbose } from "sqlite3";
import chalk from "chalk";

const sqlite3 = sqlite3Verbose();

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
    "CREATE TABLE acars (id INTEGER PRIMARY KEY AUTO_INCREMENT, time REAL, freq TEXT, mode TEXT, label TEXT, block_id TEXT, reg_no TEXT, filght_no TEXT, msg_no TEXT, text TEXT)",
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

export function closeDatabase(db: Database) {
  db.close();
}
