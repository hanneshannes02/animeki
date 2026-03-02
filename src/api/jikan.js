const BASE_URL = "https://api.jikan.moe/v4";
const LIMIT = 24;

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Fehler: ${response.status}`);
  }
  return response.json();
}

export async function fetchTopAnime(page = 1) {
  const url = `${BASE_URL}/top/anime?page=${page}&limit=${LIMIT}`;
  const payload = await fetchJson(url);
  return {
    data: payload.data ?? [],
    hasNextPage: Boolean(payload.pagination?.has_next_page),
  };
}

export async function searchAnime(query, page = 1) {
  const encoded = encodeURIComponent(query);
  const url = `${BASE_URL}/anime?q=${encoded}&page=${page}&limit=${LIMIT}&order_by=popularity&sort=asc`;
  const payload = await fetchJson(url);
  return {
    data: payload.data ?? [],
    hasNextPage: Boolean(payload.pagination?.has_next_page),
  };
}
