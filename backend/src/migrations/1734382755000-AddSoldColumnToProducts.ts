import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSoldColumnToProducts1734382755000 implements MigrationInterface {
    name = 'AddSoldColumnToProducts1734382755000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("products", new TableColumn({
            name: "sold",
            type: "int",
            default: 0,
            isNullable: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("products", "sold");
    }
}
