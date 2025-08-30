import { MigrationInterface, QueryRunner } from "typeorm";

export class seedMigrations1682107972040 implements MigrationInterface {
    name = 'seedMigrations1682107972040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seed_migrations" ("id" SERIAL NOT NULL, "timestamp" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_6de1257fe622b89ae577849731b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "seed_migrations"`);
    }

}
