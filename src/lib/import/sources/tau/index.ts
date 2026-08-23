import type { SourceAdapter } from "../types";
import { fetchTauHtml } from "./fetch";
import { parseTauHtml } from "./parse";

export const tauSource: SourceAdapter = {
  name: "אוניברסיטת תל אביב - לוח דרושים",
  async fetchListings() {
    const html = await fetchTauHtml();
    return parseTauHtml(html);
  },
};
