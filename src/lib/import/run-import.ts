import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { SOURCE_ADAPTERS } from "./sources";
import type { RawListing } from "./sources/types";
import { normalizeListing } from "./normalize";
import { matchCity } from "./fuzzy-city-match";

export type ImportSummary = {
  source: string;
  created: number;
  skipped: number;
  failed: number;
}[];

function contentHash(listing: RawListing): string {
  return createHash("sha256").update(`${listing.title}\n${listing.rawText}`).digest("hex");
}

export async function runImport(): Promise<ImportSummary> {
  const summary: ImportSummary = [];

  for (const adapter of SOURCE_ADAPTERS) {
    let created = 0;
    let skipped = 0;
    let failed = 0;

    let listings: RawListing[];
    try {
      listings = await adapter.fetchListings();
    } catch (error) {
      console.error(`[import] ${adapter.name} fetch failed:`, error);
      summary.push({ source: adapter.name, created: 0, skipped: 0, failed: 1 });
      continue;
    }

    for (const listing of listings) {
      const hash = contentHash(listing);

      // startsWith, not equals: a multi-subject listing is stored as multiple rows
      // with content_hash `${hash}:${subject}` (see below) — this still matches those.
      const existing = await prisma.jobPosting.findFirst({
        where: {
          OR: [
            { content_hash: { startsWith: hash } },
            ...(listing.externalId
              ? [{ source_name: adapter.name, source_external_id: listing.externalId }]
              : []),
          ],
        },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        continue;
      }

      try {
        const positions = await normalizeListing(listing);
        for (const position of positions) {
          const city = matchCity(position.city);
          if (!city) {
            skipped++;
            continue;
          }

          await prisma.jobPosting.create({
            data: {
              institution_id: null,
              imported: true,
              source_name: adapter.name,
              source_url: listing.url,
              source_external_id: listing.externalId,
              content_hash: positions.length > 1 ? `${hash}:${position.subject}` : hash,
              status: "published",
              title: position.title,
              subject: position.subject,
              education_stage: position.education_stage,
              scope: position.scope,
              city,
              description: position.description,
            },
          });
          created++;
        }
        if (positions.length === 0) skipped++;
      } catch (error) {
        console.error(`[import] ${adapter.name} listing failed:`, error);
        failed++;
      }
    }

    summary.push({ source: adapter.name, created, skipped, failed });
  }

  return summary;
}
