const JIKAN_BASE = "https://api.jikan.moe/v4";
const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const KITSU_BASE = "https://kitsu.io/api/edge";

const SEQUEL_HINT_PATTERN =
  /\b(season\s?\d+|s\d+|part\s?\d+|cour\s?\d+|2nd|3rd|4th|5th|ii|iii|iv|v|final season|the final|movie|ova|special)\b/i;

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getStartYear(anime) {
  return anime.year ?? anime.aired?.prop?.from?.year ?? null;
}

function appearsToBeFirstSeason(anime) {
  const allTitles = [
    anime.title,
    anime.title_english,
    anime.title_japanese,
    ...(anime.title_synonyms ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  return !SEQUEL_HINT_PATTERN.test(allTitles);
}

function isCurrentlyAiring(anime) {
  const status = String(anime.status ?? "").toLowerCase();
  return status.includes("currently airing");
}

async function fetchSeasonNowPages(maxPages = 3) {
  const all = [];

  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const payload = await fetchJson(`${JIKAN_BASE}/seasons/now?page=${page}&limit=25`);
      all.push(...(payload.data ?? []));

      if (!payload.pagination?.has_next_page) {
        break;
      }
    } catch {
      if (page === 1) {
        throw new Error("Season feed unavailable");
      }
      break;
    }
  }

  return all;
}

async function enrichAniList(title) {
  const query = `
    query($search: String) {
      Media(search: $search, type: ANIME) {
        averageScore
        popularity
        siteUrl
        genres
        episodes
        studios(isMain: true) {
          nodes { name }
        }
      }
    }
  `;

  try {
    const payload = await fetchJson(ANILIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { search: title } }),
    });

    const media = payload.data?.Media;
    return {
      score: toNumber(media?.averageScore),
      popularity: toNumber(media?.popularity),
      url: media?.siteUrl ?? null,
      genres: media?.genres ?? [],
      episodes: toNumber(media?.episodes),
      studio: media?.studios?.nodes?.[0]?.name ?? null,
    };
  } catch {
    return {
      score: null,
      popularity: null,
      url: null,
      genres: [],
      episodes: null,
      studio: null,
    };
  }
}

async function enrichKitsu(title) {
  try {
    const q = encodeURIComponent(title);
    const payload = await fetchJson(
      `${KITSU_BASE}/anime?filter[text]=${q}&page[limit]=1`,
    );
    const hit = payload.data?.[0]?.attributes;
    const id = payload.data?.[0]?.id;
    return {
      score: toNumber(hit?.averageRating),
      popularityRank: toNumber(hit?.popularityRank),
      url: id ? `https://kitsu.io/anime/${id}` : null,
    };
  } catch {
    return { score: null, popularityRank: null, url: null };
  }
}

function weightedAggregate(malScore, anilistScore, kitsuScore) {
  const parts = [];
  if (Number.isFinite(malScore)) {
    parts.push({ value: malScore * 10, weight: 0.45 });
  }
  if (Number.isFinite(anilistScore)) {
    parts.push({ value: anilistScore, weight: 0.35 });
  }
  if (Number.isFinite(kitsuScore)) {
    parts.push({ value: kitsuScore, weight: 0.2 });
  }

  if (parts.length === 0) {
    return null;
  }

  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  const weighted = parts.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight;
  return Number(weighted.toFixed(2));
}

function byRank(a, b) {
  const aggA = a.aggregateScore ?? -1;
  const aggB = b.aggregateScore ?? -1;
  if (aggB !== aggA) {
    return aggB - aggA;
  }

  const malA = a.malMembers ?? 0;
  const malB = b.malMembers ?? 0;
  return malB - malA;
}

async function enrichTitle(anime) {
  const title = anime.title_english || anime.title || "Unknown";
  const [anilist, kitsu] = await Promise.all([enrichAniList(title), enrichKitsu(title)]);
  const malScore = toNumber(anime.score);
  const aggregateScore = weightedAggregate(malScore, anilist.score, kitsu.score);

  const genres =
    anime.genres?.map((genre) => genre.name) ??
    anilist.genres ??
    [];

  return {
    malId: anime.mal_id,
    title,
    titleNative: anime.title_japanese || null,
    synopsis: anime.synopsis || null,
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
    year: getStartYear(anime),
    episodes: anime.episodes ?? anilist.episodes ?? null,
    studio: anime.studios?.[0]?.name || anilist.studio || null,
    genres: genres.slice(0, 4),
    malScore,
    anilistScore: anilist.score,
    kitsuScore: kitsu.score,
    aggregateScore,
    malMembers: toNumber(anime.members),
    popularity: toNumber(anime.popularity) ?? anilist.popularity,
    links: {
      mal: anime.url ?? null,
      anilist: anilist.url,
      kitsu: kitsu.url,
    },
  };
}

export async function fetchTopFirstSeasonAiringAnime2026(limit = 10) {
  let raw = [];
  try {
    raw = await fetchSeasonNowPages(4);
  } catch {
    const fallback = await fetchJson(`${JIKAN_BASE}/top/anime?filter=airing&limit=50`);
    raw = fallback.data ?? [];
  }

  const deduped = [];
  const seen = new Set();

  for (const anime of raw) {
    if (!anime?.mal_id || seen.has(anime.mal_id)) {
      continue;
    }
    seen.add(anime.mal_id);
    deduped.push(anime);
  }

  const baseFiltered = deduped.filter(
    (anime) =>
      getStartYear(anime) === 2026 &&
      isCurrentlyAiring(anime) &&
      appearsToBeFirstSeason(anime),
  );

  const enriched = await Promise.all(baseFiltered.map((anime) => enrichTitle(anime)));
  return enriched.sort(byRank).slice(0, limit);
}
