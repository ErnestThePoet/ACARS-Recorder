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

  @Column(DataTypes.INTEGER)
  channel: number;

  @Column(DataTypes.DOUBLE)
  level: number;

  @Column(DataTypes.INTEGER)
  error: number;

  @Column(DataTypes.CHAR(1))
  mode: string;

  @Column(DataTypes.CHAR(2))
  label: string;

  @Column(DataTypes.CHAR(2))
  subLabel: string;

  @Column(DataTypes.CHAR(1))
  blockId: string;

  @Column(DataTypes.CHAR(1))
  ack: string;

  @Column(DataTypes.STRING(10))
  regNo: string;

  @Column(DataTypes.STRING(10))
  flightNo: string;

  @Column(DataTypes.CHAR(4))
  msgNo: string;

  @Column(DataTypes.TEXT)
  text: string;

  @Column(DataTypes.TEXT)
  libacars: string;
}
