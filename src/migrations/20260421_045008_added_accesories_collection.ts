import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "accessories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accessories_id" integer;
  ALTER TABLE "accessories" ADD CONSTRAINT "accessories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "accessories_image_idx" ON "accessories" USING btree ("image_id");
  CREATE INDEX "accessories_updated_at_idx" ON "accessories" USING btree ("updated_at");
  CREATE INDEX "accessories_created_at_idx" ON "accessories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accessories_fk" FOREIGN KEY ("accessories_id") REFERENCES "public"."accessories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_accessories_id_idx" ON "payload_locked_documents_rels" USING btree ("accessories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accessories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "accessories" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accessories_fk";
  
  DROP INDEX "payload_locked_documents_rels_accessories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accessories_id";`)
}
