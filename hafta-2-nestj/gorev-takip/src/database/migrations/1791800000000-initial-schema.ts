import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791800000000 implements MigrationInterface {
  name = 'InitialSchema1791800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "users" (
      "id" SERIAL NOT NULL,
      "email" text NOT NULL,
      "password" text NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_users" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_users_email" UNIQUE ("email")
    )`);
    await queryRunner.query(`CREATE TABLE "tasks" (
      "id" SERIAL NOT NULL,
      "title" text NOT NULL,
      "done" boolean NOT NULL DEFAULT false,
      "user_id" integer,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_tasks" PRIMARY KEY ("id"),
      CONSTRAINT "FK_tasks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      'CREATE INDEX "IDX_tasks_user_id" ON "tasks" ("user_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "tasks"');
    await queryRunner.query('DROP TABLE "users"');
  }
}
