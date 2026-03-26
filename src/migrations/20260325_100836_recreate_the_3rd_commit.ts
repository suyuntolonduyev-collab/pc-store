import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ru', 'ky');
  CREATE TYPE "public"."enum_motherboards_form_factor" AS ENUM('ATX', 'Micro-ATX', 'Mini-ITX');
  CREATE TYPE "public"."enum_processors_brand" AS ENUM('intel', 'amd');
  CREATE TYPE "public"."enum_processors_socket" AS ENUM('LGA1700', 'LGA1200', 'AM4', 'AM5', 'TR4');
  CREATE TYPE "public"."enum_ram_type" AS ENUM('DDR4', 'DDR5');
  CREATE TYPE "public"."enum_psus_form_factor" AS ENUM('ATX', 'SFX', 'SFX-L');
  CREATE TYPE "public"."enum_storage_type" AS ENUM('NVMe', 'SATA SSD', 'HDD');
  CREATE TYPE "public"."enum_storage_interface" AS ENUM('M.2', 'SATA');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled');
  CREATE TABLE "motherboards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric NOT NULL,
  	"socket" varchar NOT NULL,
  	"form_factor" "enum_motherboards_form_factor" NOT NULL,
  	"supports_ddr4" boolean DEFAULT false,
  	"supports_ddr5" boolean DEFAULT false,
  	"ram_slots" numeric NOT NULL,
  	"m2_slots" numeric NOT NULL,
  	"sata_ports" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "processors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" "enum_processors_brand" NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer NOT NULL,
  	"description" jsonb,
  	"stock_quantity" numeric DEFAULT 0 NOT NULL,
  	"socket" "enum_processors_socket" NOT NULL,
  	"tdp" numeric NOT NULL,
  	"supports_ddr4" boolean DEFAULT true,
  	"supports_ddr5" boolean DEFAULT false,
  	"has_graphics" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gpus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric NOT NULL,
  	"length_mm" numeric NOT NULL,
  	"recommended_psu_w" numeric NOT NULL,
  	"connector_8pin" numeric NOT NULL,
  	"connector_16pin" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ram" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric NOT NULL,
  	"type" "enum_ram_type" NOT NULL,
  	"modules_count" numeric NOT NULL,
  	"total_capacity_gb" numeric NOT NULL,
  	"speed_mhz" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "psus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric DEFAULT 0 NOT NULL,
  	"wattage" numeric NOT NULL,
  	"form_factor" "enum_psus_form_factor" DEFAULT 'ATX' NOT NULL,
  	"pcie_connectors" numeric DEFAULT 2 NOT NULL,
  	"has_16pin_connector" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric DEFAULT 0 NOT NULL,
  	"supports_atx" boolean DEFAULT false,
  	"supports_matx" boolean DEFAULT false,
  	"supports_itx" boolean DEFAULT false,
  	"max_gpu_length_mm" numeric NOT NULL,
  	"max_cooler_height_mm" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coolers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric DEFAULT 0 NOT NULL,
  	"supports_lga1700" boolean DEFAULT false,
  	"supports_am4" boolean DEFAULT false,
  	"supports_am5" boolean DEFAULT false,
  	"max_tdp" numeric NOT NULL,
  	"height_mm" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "storage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"brand" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"stock_quantity" numeric DEFAULT 0 NOT NULL,
  	"type" "enum_storage_type" NOT NULL,
  	"interface" "enum_storage_interface" NOT NULL,
  	"capacity_gb" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "builds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"is_complete" boolean DEFAULT false,
  	"cpu_id" integer,
  	"mobo_id" integer,
  	"gpu_id" integer,
  	"ram_id" integer,
  	"psu_id" integer,
  	"case_id" integer,
  	"cooler_id" integer,
  	"storage_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"build_id" integer NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"total_price" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "motherboards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "processors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "gpus_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ram_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "psus_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cases_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "coolers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "storage_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "builds_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "motherboards" ADD CONSTRAINT "motherboards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "processors" ADD CONSTRAINT "processors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gpus" ADD CONSTRAINT "gpus_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ram" ADD CONSTRAINT "ram_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "psus" ADD CONSTRAINT "psus_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coolers" ADD CONSTRAINT "coolers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "storage" ADD CONSTRAINT "storage_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_cpu_id_processors_id_fk" FOREIGN KEY ("cpu_id") REFERENCES "public"."processors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_mobo_id_motherboards_id_fk" FOREIGN KEY ("mobo_id") REFERENCES "public"."motherboards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_gpu_id_gpus_id_fk" FOREIGN KEY ("gpu_id") REFERENCES "public"."gpus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_ram_id_ram_id_fk" FOREIGN KEY ("ram_id") REFERENCES "public"."ram"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_psu_id_psus_id_fk" FOREIGN KEY ("psu_id") REFERENCES "public"."psus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_cooler_id_coolers_id_fk" FOREIGN KEY ("cooler_id") REFERENCES "public"."coolers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_storage_id_storage_id_fk" FOREIGN KEY ("storage_id") REFERENCES "public"."storage"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "motherboards_image_idx" ON "motherboards" USING btree ("image_id");
  CREATE INDEX "motherboards_updated_at_idx" ON "motherboards" USING btree ("updated_at");
  CREATE INDEX "motherboards_created_at_idx" ON "motherboards" USING btree ("created_at");
  CREATE INDEX "processors_name_idx" ON "processors" USING btree ("name");
  CREATE INDEX "processors_brand_idx" ON "processors" USING btree ("brand");
  CREATE INDEX "processors_price_idx" ON "processors" USING btree ("price");
  CREATE INDEX "processors_image_idx" ON "processors" USING btree ("image_id");
  CREATE INDEX "processors_updated_at_idx" ON "processors" USING btree ("updated_at");
  CREATE INDEX "processors_created_at_idx" ON "processors" USING btree ("created_at");
  CREATE INDEX "gpus_image_idx" ON "gpus" USING btree ("image_id");
  CREATE INDEX "gpus_updated_at_idx" ON "gpus" USING btree ("updated_at");
  CREATE INDEX "gpus_created_at_idx" ON "gpus" USING btree ("created_at");
  CREATE INDEX "ram_image_idx" ON "ram" USING btree ("image_id");
  CREATE INDEX "ram_updated_at_idx" ON "ram" USING btree ("updated_at");
  CREATE INDEX "ram_created_at_idx" ON "ram" USING btree ("created_at");
  CREATE INDEX "psus_image_idx" ON "psus" USING btree ("image_id");
  CREATE INDEX "psus_updated_at_idx" ON "psus" USING btree ("updated_at");
  CREATE INDEX "psus_created_at_idx" ON "psus" USING btree ("created_at");
  CREATE INDEX "cases_image_idx" ON "cases" USING btree ("image_id");
  CREATE INDEX "cases_updated_at_idx" ON "cases" USING btree ("updated_at");
  CREATE INDEX "cases_created_at_idx" ON "cases" USING btree ("created_at");
  CREATE INDEX "coolers_image_idx" ON "coolers" USING btree ("image_id");
  CREATE INDEX "coolers_updated_at_idx" ON "coolers" USING btree ("updated_at");
  CREATE INDEX "coolers_created_at_idx" ON "coolers" USING btree ("created_at");
  CREATE INDEX "storage_image_idx" ON "storage" USING btree ("image_id");
  CREATE INDEX "storage_updated_at_idx" ON "storage" USING btree ("updated_at");
  CREATE INDEX "storage_created_at_idx" ON "storage" USING btree ("created_at");
  CREATE INDEX "builds_user_idx" ON "builds" USING btree ("user_id");
  CREATE INDEX "builds_cpu_idx" ON "builds" USING btree ("cpu_id");
  CREATE INDEX "builds_mobo_idx" ON "builds" USING btree ("mobo_id");
  CREATE INDEX "builds_gpu_idx" ON "builds" USING btree ("gpu_id");
  CREATE INDEX "builds_ram_idx" ON "builds" USING btree ("ram_id");
  CREATE INDEX "builds_psu_idx" ON "builds" USING btree ("psu_id");
  CREATE INDEX "builds_case_idx" ON "builds" USING btree ("case_id");
  CREATE INDEX "builds_cooler_idx" ON "builds" USING btree ("cooler_id");
  CREATE INDEX "builds_storage_idx" ON "builds" USING btree ("storage_id");
  CREATE INDEX "builds_updated_at_idx" ON "builds" USING btree ("updated_at");
  CREATE INDEX "builds_created_at_idx" ON "builds" USING btree ("created_at");
  CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");
  CREATE INDEX "orders_build_idx" ON "orders" USING btree ("build_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_motherboards_fk" FOREIGN KEY ("motherboards_id") REFERENCES "public"."motherboards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_processors_fk" FOREIGN KEY ("processors_id") REFERENCES "public"."processors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gpus_fk" FOREIGN KEY ("gpus_id") REFERENCES "public"."gpus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ram_fk" FOREIGN KEY ("ram_id") REFERENCES "public"."ram"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_psus_fk" FOREIGN KEY ("psus_id") REFERENCES "public"."psus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coolers_fk" FOREIGN KEY ("coolers_id") REFERENCES "public"."coolers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_storage_fk" FOREIGN KEY ("storage_id") REFERENCES "public"."storage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_builds_fk" FOREIGN KEY ("builds_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_motherboards_id_idx" ON "payload_locked_documents_rels" USING btree ("motherboards_id");
  CREATE INDEX "payload_locked_documents_rels_processors_id_idx" ON "payload_locked_documents_rels" USING btree ("processors_id");
  CREATE INDEX "payload_locked_documents_rels_gpus_id_idx" ON "payload_locked_documents_rels" USING btree ("gpus_id");
  CREATE INDEX "payload_locked_documents_rels_ram_id_idx" ON "payload_locked_documents_rels" USING btree ("ram_id");
  CREATE INDEX "payload_locked_documents_rels_psus_id_idx" ON "payload_locked_documents_rels" USING btree ("psus_id");
  CREATE INDEX "payload_locked_documents_rels_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("cases_id");
  CREATE INDEX "payload_locked_documents_rels_coolers_id_idx" ON "payload_locked_documents_rels" USING btree ("coolers_id");
  CREATE INDEX "payload_locked_documents_rels_storage_id_idx" ON "payload_locked_documents_rels" USING btree ("storage_id");
  CREATE INDEX "payload_locked_documents_rels_builds_id_idx" ON "payload_locked_documents_rels" USING btree ("builds_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "motherboards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "processors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gpus" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ram" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "psus" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coolers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "storage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "builds" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "motherboards" CASCADE;
  DROP TABLE "processors" CASCADE;
  DROP TABLE "gpus" CASCADE;
  DROP TABLE "ram" CASCADE;
  DROP TABLE "psus" CASCADE;
  DROP TABLE "cases" CASCADE;
  DROP TABLE "coolers" CASCADE;
  DROP TABLE "storage" CASCADE;
  DROP TABLE "builds" CASCADE;
  DROP TABLE "orders" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_motherboards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_processors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_gpus_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ram_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_psus_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cases_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_coolers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_storage_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_builds_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_motherboards_id_idx";
  DROP INDEX "payload_locked_documents_rels_processors_id_idx";
  DROP INDEX "payload_locked_documents_rels_gpus_id_idx";
  DROP INDEX "payload_locked_documents_rels_ram_id_idx";
  DROP INDEX "payload_locked_documents_rels_psus_id_idx";
  DROP INDEX "payload_locked_documents_rels_cases_id_idx";
  DROP INDEX "payload_locked_documents_rels_coolers_id_idx";
  DROP INDEX "payload_locked_documents_rels_storage_id_idx";
  DROP INDEX "payload_locked_documents_rels_builds_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "motherboards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "processors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gpus_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ram_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "psus_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cases_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "coolers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "storage_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "builds_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_motherboards_form_factor";
  DROP TYPE "public"."enum_processors_brand";
  DROP TYPE "public"."enum_processors_socket";
  DROP TYPE "public"."enum_ram_type";
  DROP TYPE "public"."enum_psus_form_factor";
  DROP TYPE "public"."enum_storage_type";
  DROP TYPE "public"."enum_storage_interface";
  DROP TYPE "public"."enum_orders_status";`)
}
