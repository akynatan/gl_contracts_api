import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContract1756069205064 implements MigrationInterface {
    name = 'CreateContract1756069205064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contracts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "active" boolean NOT NULL DEFAULT true, "number_contract_hubsoft" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending_signature', "envelope_id" character varying, "document_id" character varying, "signer_id" character varying, "requisit_id" character varying, "requisit_authentication_id" character varying, "notification_id" character varying, "document_url_signed" character varying, "document_signed_at" TIMESTAMP, "client_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "contracts" ADD CONSTRAINT "FK_9945462ca96b2c7d0a97e012cdc" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contracts" DROP CONSTRAINT "FK_9945462ca96b2c7d0a97e012cdc"`);
        await queryRunner.query(`DROP TABLE "contracts"`);
    }

}
