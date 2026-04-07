import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_builds_tags" AS ENUM('gaming', 'budget', 'workstation');
  CREATE TABLE "builds_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_builds_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "processors_brand_idx";
  ALTER TABLE "processors" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "processors" ALTER COLUMN "description" SET DATA TYPE varchar;
  ALTER TABLE "motherboards" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "processors" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "gpus" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "ram" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "psus" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "cases" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "coolers" ADD COLUMN "brand_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "brands_id" integer;
  ALTER TABLE "builds_tags" ADD CONSTRAINT "builds_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "builds_tags_order_idx" ON "builds_tags" USING btree ("order");
  CREATE INDEX "builds_tags_parent_idx" ON "builds_tags" USING btree ("parent_id");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  ALTER TABLE "motherboards" ADD CONSTRAINT "motherboards_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "processors" ADD CONSTRAINT "processors_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gpus" ADD CONSTRAINT "gpus_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ram" ADD CONSTRAINT "ram_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "psus" ADD CONSTRAINT "psus_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coolers" ADD CONSTRAINT "coolers_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "motherboards_brand_idx" ON "motherboards" USING btree ("brand_id");
  CREATE INDEX "gpus_brand_idx" ON "gpus" USING btree ("brand_id");
  CREATE INDEX "ram_brand_idx" ON "ram" USING btree ("brand_id");
  CREATE INDEX "psus_brand_idx" ON "psus" USING btree ("brand_id");
  CREATE INDEX "cases_brand_idx" ON "cases" USING btree ("brand_id");
  CREATE INDEX "coolers_brand_idx" ON "coolers" USING btree ("brand_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "processors_brand_idx" ON "processors" USING btree ("brand_id");
  ALTER TABLE "motherboards" DROP COLUMN "brand";
  ALTER TABLE "processors" DROP COLUMN "brand";
  ALTER TABLE "gpus" DROP COLUMN "brand";
  ALTER TABLE "ram" DROP COLUMN "brand";
  ALTER TABLE "psus" DROP COLUMN "brand";
  ALTER TABLE "cases" DROP COLUMN "brand";
  ALTER TABLE "coolers" DROP COLUMN "brand";
  DROP TYPE "public"."enum_processors_brand";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_processors_brand" AS ENUM('intel', 'amd');
  ALTER TABLE "builds_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "builds_tags" CASCADE;
  DROP TABLE "brands" CASCADE;
  ALTER TABLE "motherboards" DROP CONSTRAINT "motherboards_brand_id_brands_id_fk";
  
  ALTER TABLE "processors" DROP CONSTRAINT "processors_brand_id_brands_id_fk";
  
  ALTER TABLE "gpus" DROP CONSTRAINT "gpus_brand_id_brands_id_fk";
  
  ALTER TABLE "ram" DROP CONSTRAINT "ram_brand_id_brands_id_fk";
  
  ALTER TABLE "psus" DROP CONSTRAINT "psus_brand_id_brands_id_fk";
  
  ALTER TABLE "cases" DROP CONSTRAINT "cases_brand_id_brands_id_fk";
  
  ALTER TABLE "coolers" DROP CONSTRAINT "coolers_brand_id_brands_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_brands_fk";
  
  DROP INDEX "motherboards_brand_idx";
  DROP INDEX "gpus_brand_idx";
  DROP INDEX "ram_brand_idx";
  DROP INDEX "psus_brand_idx";
  DROP INDEX "cases_brand_idx";
  DROP INDEX "coolers_brand_idx";
  DROP INDEX "payload_locked_documents_rels_brands_id_idx";
  DROP INDEX "processors_brand_idx";
  ALTER TABLE "processors" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "processors" ALTER COLUMN "description" SET DATA TYPE jsonb;
  ALTER TABLE "motherboards" ADD COLUMN "brand" varchar NOT NULL;
  ALTER TABLE "processors" ADD COLUMN "brand" "enum_processors_brand" NOT NULL;
  ALTER TABLE "gpus" ADD COLUMN "brand" varchar NOT NULL;
  ALTER TABLE "ram" ADD COLUMN "brand" varchar NOT NULL;
  ALTER TABLE "psus" ADD COLUMN "brand" varchar NOT NULL;
  ALTER TABLE "cases" ADD COLUMN "brand" varchar NOT NULL;
  ALTER TABLE "coolers" ADD COLUMN "brand" varchar NOT NULL;
  CREATE INDEX "processors_brand_idx" ON "processors" USING btree ("brand");
  ALTER TABLE "motherboards" DROP COLUMN "brand_id";
  ALTER TABLE "processors" DROP COLUMN "brand_id";
  ALTER TABLE "gpus" DROP COLUMN "brand_id";
  ALTER TABLE "ram" DROP COLUMN "brand_id";
  ALTER TABLE "psus" DROP COLUMN "brand_id";
  ALTER TABLE "cases" DROP COLUMN "brand_id";
  ALTER TABLE "coolers" DROP COLUMN "brand_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "brands_id";
  DROP TYPE "public"."enum_builds_tags";`)
}
