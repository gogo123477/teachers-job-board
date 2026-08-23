import type { SourceAdapter } from "../types";
import { fetchOrtHtml } from "./fetch";
import { parseOrtHtml } from "./parse";

export const ortSource: SourceAdapter = {
  name: "אורט",
  async fetchListings() {
    const html = await fetchOrtHtml();
    return parseOrtHtml(html);
  },
};
