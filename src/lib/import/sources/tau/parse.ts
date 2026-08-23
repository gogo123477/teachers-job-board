import * as cheerio from "cheerio";
import type { RawListing } from "../types";
import { TAU_JOBS_URL } from "./fetch";

const DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function parseDate(text: string): Date | undefined {
  const match = DATE_RE.exec(text.trim());
  if (!match) return undefined;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * The page is a single big <table> with a header row (תאריך / פירוט המשרה)
 * followed by one row per posting: date cell + free-text description cell.
 * Rich-text-pasted content wraps nearly every word in its own <span>, but
 * cheerio's .text() concatenates it back into readable text.
 */
export function parseTauHtml(html: string): RawListing[] {
  const $ = cheerio.load(html);
  const listings: RawListing[] = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const dateText = $(cells[0]).text().trim();
    const bodyText = $(cells[1])
      .text()
      .replace(/ /g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (!bodyText || dateText === "תאריך") return;

    listings.push({
      title: bodyText.slice(0, 120),
      rawText: bodyText,
      url: TAU_JOBS_URL,
      postedAt: parseDate(dateText),
    });
  });

  return listings;
}
