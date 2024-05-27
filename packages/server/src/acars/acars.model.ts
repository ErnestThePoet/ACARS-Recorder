import { Column, Model, Table } from "sequelize-typescript";

@Table
export class Acars extends Model{
    @Column
    blockId: string;
}