import * as cheerio from "cheerio";
import type { RawListing } from "../types";
import { ORT_CAREER_URL } from "./fetch";

/**
 * The page is an Elementor landing page: each opening lives in its own
 * .elementor-column, marked by a heading "דרוש/ה:" or "דרושים/ות:" followed
 * by a heading with the actual title, and one or more text-editor widgets
 * with the description/contact details. Non-job columns don't have that marker.
 */
export function parseOrtHtml(html: string): RawListing[] {
  const $ = cheerio.load(html);
  const listings: RawListing[] = [];

  $(".elementor-widget-heading h2.elementor-heading-title").each((_, el) => {
    const marker = $(el).text().trim();
    if (marker !== "דרוש/ה:" && !marker.startsWith("דרושים/ות")) return;

    const column = $(el).closest(".elementor-column");
    if (!column.length) return;

    const headings = column
      .find(".elementor-widget-heading h2.elementor-heading-title")
      .map((_, h) => $(h).text().trim())
      .get();
    const title = headings[1];
    if (!title) return;

    const bodyTexts = column
      .find(".elementor-widget-text-editor")
      .map((_, t) => $(t).text().trim())
      .get()
      .filter(Boolean);

    listings.push({
      title,
      rawText: [title, ...bodyTexts].join("\n\n"),
      url: ORT_CAREER_URL,
    });
  });

  return listings;
}
