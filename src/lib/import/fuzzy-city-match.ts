import { CITIES, isCity, type City } from "@/lib/cities";

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function normalize(value: string): string {
  return value
    .trim()
    .replace(/["׳']/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\([^)]*\)\s*$/, "");
}

/**
 * The LLM normalization step is instructed not to see the full CITIES list
 * (too large to put in every prompt), so it returns the city as free text —
 * this matches it back to our closed taxonomy. Returns undefined rather than
 * guessing wrong: a bad city breaks search filtering, worse than skipping.
 */
export function matchCity(rawCity: string | undefined | null): City | undefined {
  if (!rawCity) return undefined;
  const cleaned = normalize(rawCity);
  if (!cleaned) return undefined;
  if (isCity(cleaned)) return cleaned as City;

  let best: City | undefined;
  let bestDistance = Infinity;
  for (const city of CITIES) {
    const distance = levenshtein(cleaned, city);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = city;
    }
  }

  const threshold = cleaned.length <= 4 ? 1 : 2;
  return bestDistance <= threshold ? best : undefined;
}
