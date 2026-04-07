import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feedback_fields_type" AS ENUM('name', 'email', 'message');
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"mission" varchar,
  	"founded_year" numeric,
  	"team_size" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"working_hours" varchar,
  	"telegram" varchar,
  	"whatsapp" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "featured_product_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"build_id" integer NOT NULL
  );
  
  CREATE TABLE "featured_product_list" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "feedback_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_feedback_fields_type" NOT NULL,
  	"required" boolean DEFAULT true
  );
  
  CREATE TABLE "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_enabled" boolean,
  	"recipient_email" varchar,
  	"success_message" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "instruction_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step_number" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"tip" varchar
  );
  
  CREATE TABLE "instruction" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "featured_product_list_items" ADD CONSTRAINT "featured_product_list_items_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "featured_product_list_items" ADD CONSTRAINT "featured_product_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."featured_product_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_fields" ADD CONSTRAINT "feedback_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instruction_steps" ADD CONSTRAINT "instruction_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instruction"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "featured_product_list_items_order_idx" ON "featured_product_list_items" USING btree ("_order");
  CREATE INDEX "featured_product_list_items_parent_id_idx" ON "featured_product_list_items" USING btree ("_parent_id");
  CREATE INDEX "featured_product_list_items_build_idx" ON "featured_product_list_items" USING btree ("build_id");
  CREATE INDEX "feedback_fields_order_idx" ON "feedback_fields" USING btree ("_order");
  CREATE INDEX "feedback_fields_parent_id_idx" ON "feedback_fields" USING btree ("_parent_id");
  CREATE INDEX "instruction_steps_order_idx" ON "instruction_steps" USING btree ("_order");
  CREATE INDEX "instruction_steps_parent_id_idx" ON "instruction_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "about" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "featured_product_list_items" CASCADE;
  DROP TABLE "featured_product_list" CASCADE;
  DROP TABLE "feedback_fields" CASCADE;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "instruction_steps" CASCADE;
  DROP TABLE "instruction" CASCADE;
  DROP TYPE "public"."enum_feedback_fields_type";`)
}
