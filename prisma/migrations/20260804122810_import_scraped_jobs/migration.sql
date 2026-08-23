-- AlterTable: allow imported jobs with no owning Institution
ALTER TABLE "JobPosting" ALTER COLUMN "institution_id" DROP NOT NULL;

-- AlterTable: import metadata
ALTER TABLE "JobPosting" ADD COLUMN "imported" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "JobPosting" ADD COLUMN "source_name" TEXT;
ALTER TABLE "JobPosting" ADD COLUMN "source_url" TEXT;
ALTER TABLE "JobPosting" ADD COLUMN "source_external_id" TEXT;
ALTER TABLE "JobPosting" ADD COLUMN "content_hash" TEXT;

-- Dedupe: same source + same external id never imported twice.
-- Postgres treats NULLs as distinct, so this doesn't block non-imported rows (both NULL).
CREATE UNIQUE INDEX "JobPosting_source_name_source_external_id_key"
  ON "JobPosting" ("source_name", "source_external_id");

-- Fallback dedupe for sources with no stable per-posting id.
CREATE UNIQUE INDEX "JobPosting_content_hash_key"
  ON "JobPosting" ("content_hash");
