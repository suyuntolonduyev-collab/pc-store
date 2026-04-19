import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "processors" ADD COLUMN "fps_multiplier" numeric DEFAULT 1 NOT NULL;
  ALTER TABLE "gpus" ADD COLUMN "fps_presets_esports" numeric DEFAULT 240 NOT NULL;
  ALTER TABLE "gpus" ADD COLUMN "fps_presets_aaa" numeric DEFAULT 85 NOT NULL;
  ALTER TABLE "gpus" ADD COLUMN "fps_presets_casual" numeric DEFAULT 160 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "processors" DROP COLUMN "fps_multiplier";
  ALTER TABLE "gpus" DROP COLUMN "fps_presets_esports";
  ALTER TABLE "gpus" DROP COLUMN "fps_presets_aaa";
  ALTER TABLE "gpus" DROP COLUMN "fps_presets_casual";`)
}
