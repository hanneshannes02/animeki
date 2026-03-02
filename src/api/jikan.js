const BASE_URL = "https://api.jikan.moe/v4";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Fehler: ${response.status}`);
  }
  return response.json();
}

function getStartYear(anime) {
  return anime.year ?? anime.aired?.prop?.from?.year ?? null;
}

function byRanking(a, b) {
  const scoreA = a.score ?? 0;
  const scoreB = b.score ?? 0;
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }
  const popA = a.popularity ?? Number.MAX_SAFE_INTEGER;
  const popB = b.popularity ?? Number.MAX_SAFE_INTEGER;
  return popA - popB;
}

export async function fetchTopAiringAnimeForYear(year = 2026, limit = 10) {
  const seasonNowUrl = `${BASE_URL}/seasons/now?limit=25`;
  const topAiringUrl = `${BASE_URL}/top/anime?filter=airing&limit=25`;

  const [seasonNowPayload, topAiringPayload] = await Promise.all([
    fetchJson(seasonNowUrl),
    fetchJson(topAiringUrl),
  ]);

  const merged = [...(seasonNowPayload.data ?? []), ...(topAiringPayload.data ?? [])];
  const deduped = [];
  const seen = new Set();

  for (const anime of merged) {
    if (!anime?.mal_id || seen.has(anime.mal_id)) {
      continue;
    }
    seen.add(anime.mal_id);
    deduped.push(anime);
  }

  const filtered = deduped.filter((anime) => {
    const startYear = getStartYear(anime);
    const status = String(anime.status ?? "").toLowerCase();
    return startYear === year && status.includes("currently airing");
  });

  return filtered.sort(byRanking).slice(0, limit);
}
