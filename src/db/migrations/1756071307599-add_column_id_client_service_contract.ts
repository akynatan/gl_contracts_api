import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnIdClientServiceContract1756071307599 implements MigrationInterface {
    name = 'AddColumnIdClientServiceContract1756071307599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contracts" ADD "id_client_service_contract" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contracts" DROP COLUMN "id_client_service_contract"`);
    }

}
