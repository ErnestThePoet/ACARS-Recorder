import { DataTypes } from "sequelize";
import { Column, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "acars",
})
export class Acars extends Model {
  @Column(DataTypes.DOUBLE)
  time: number;

  @Column(DataTypes.CHAR(7))
  freq: string;

  @Column(DataTypes.DOUBLE)
  level: number;

  @Column(DataTypes.INTEGER)
  error: number;

  @Column(DataTypes.CHAR(1))
  mode: string;

  @Column(DataTypes.CHAR(2))
  label: string;

  @Column(DataTypes.CHAR(2))
  subLabel: string | null;

  @Column(DataTypes.CHAR(1))
  blockId: string | null;

  @Column(DataTypes.CHAR(1))
  ack: string | null;

  @Column(DataTypes.STRING(10))
  regNo: string | null;

  @Column(DataTypes.STRING(10))
  flightNo: string | null;

  @Column(DataTypes.CHAR(4))
  msgNo: string | null;

  @Column(DataTypes.TEXT)
  text: string | null;

  @Column(DataTypes.TEXT)
  libacars: string | null;
}

export type AcarsEntity = Pick<
  Acars,
  | "time"
  | "freq"
  | "level"
  | "error"
  | "mode"
  | "label"
  | "subLabel"
  | "blockId"
  | "ack"
  | "regNo"
  | "flightNo"
  | "msgNo"
  | "text"
  | "libacars"
>;
