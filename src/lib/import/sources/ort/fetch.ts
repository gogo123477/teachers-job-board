export const ORT_CAREER_URL = "https://landing.ort.org.il/ort-career/";

const USER_AGENT =
  "drushimorim-import-bot/1.0 (+https://teachers-job-board-six.vercel.app; job listing aggregator)";

export async function fetchOrtHtml(): Promise<string> {
  const res = await fetch(ORT_CAREER_URL, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`ORT career page fetch failed: ${res.status}`);
  }
  return res.text();
}
