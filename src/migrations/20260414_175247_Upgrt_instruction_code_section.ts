import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "instruction_configurator_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"tip" varchar
  );
  
  CREATE TABLE "instruction_configurator" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Как пользоваться конфигуратором' NOT NULL,
  	"intro" varchar,
  	"banner_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';
  ALTER TABLE "instruction" ALTER COLUMN "title" SET DEFAULT 'Инструкция к Конфигуратору';
  ALTER TABLE "instruction" ADD COLUMN "banner_id" integer;
  ALTER TABLE "instruction_configurator_steps" ADD CONSTRAINT "instruction_configurator_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instruction_configurator"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instruction_configurator" ADD CONSTRAINT "instruction_configurator_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "instruction_configurator_steps_order_idx" ON "instruction_configurator_steps" USING btree ("_order");
  CREATE INDEX "instruction_configurator_steps_parent_id_idx" ON "instruction_configurator_steps" USING btree ("_parent_id");
  CREATE INDEX "instruction_configurator_banner_idx" ON "instruction_configurator" USING btree ("banner_id");
  ALTER TABLE "instruction" ADD CONSTRAINT "instruction_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "instruction_banner_idx" ON "instruction" USING btree ("banner_id");
  ALTER TABLE "instruction_steps" DROP COLUMN "step_number";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instruction_configurator_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instruction_configurator" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "instruction_configurator_steps" CASCADE;
  DROP TABLE "instruction_configurator" CASCADE;
  ALTER TABLE "instruction" DROP CONSTRAINT "instruction_banner_id_media_id_fk";
  
  DROP INDEX "instruction_banner_idx";
  ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
  ALTER TABLE "instruction" ALTER COLUMN "title" DROP DEFAULT;
  ALTER TABLE "instruction_steps" ADD COLUMN "step_number" numeric NOT NULL;
  ALTER TABLE "instruction" DROP COLUMN "banner_id";`)
}
