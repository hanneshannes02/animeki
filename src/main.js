import { clearGrid, renderAnimeCards, renderStatus } from "./ui/render.js";

const grid = document.querySelector("#animeGrid");
const status = document.querySelector("#status");
const heroCount = document.querySelector("#heroCount");
const heroDescription = document.querySelector("#heroDescription");
const generatedAt = document.querySelector("#generatedAt");

async function initPage() {
  clearGrid(grid);
  renderStatus(status, "Lade lokale Snapshot-Daten...", "info");

  try {
    const response = await fetch("/data/top10-2026.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Snapshot not found");
    }

    const payload = await response.json();
    const animeList = (payload.items ?? []).map((item) => ({
      ...item,
      watchUrl: item.watchUrl ?? item.links?.mal ?? item.links?.anilist ?? item.links?.kitsu ?? null,
    }));
    renderAnimeCards(grid, animeList);
    heroCount.textContent = String(animeList.length);

    if (animeList.length === 0) {
      heroDescription.textContent = "Keine passenden Titel gefunden.";
      generatedAt.textContent = "kein Snapshot";
      renderStatus(status, "Keine Erststaffel-Titel verfuegbar.", "warn");
      return;
    }

    const generatedAtText = payload.generatedAt
      ? new Date(payload.generatedAt).toLocaleString("de-DE")
      : "unbekannt";
    generatedAt.textContent = generatedAtText;
    heroDescription.textContent =
      `Snapshot vom ${generatedAtText}. Ranking: 45% MAL, 35% AniList, 20% Kitsu.`;
    renderStatus(status, `${animeList.length} Titel aus lokaler Datei geladen`, "success");
  } catch {
    heroDescription.textContent = "Lokale Daten fehlen. Fuehre 'npm run snapshot' aus.";
    generatedAt.textContent = "nicht verfuegbar";
    renderStatus(status, "Snapshot-Datei konnte nicht geladen werden.", "error");
  }
}

initPage();
