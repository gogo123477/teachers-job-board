export const TAU_JOBS_URL = "https://education.tau.ac.il/morim/teaching_jobs";

const USER_AGENT =
  "drushimorim-import-bot/1.0 (+https://teachers-job-board-six.vercel.app; job listing aggregator)";

// robots.txt on this host declares `Crawl-delay: 10`; we only issue a single
// request per import run against this page, so no extra throttling is needed here.
export async function fetchTauHtml(): Promise<string> {
  const res = await fetch(TAU_JOBS_URL, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`TAU jobs page fetch failed: ${res.status}`);
  }
  return res.text();
}
