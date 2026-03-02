import { clearGrid, renderAnimeCards, renderStatus } from "./ui/render.js";

const grid = document.querySelector("#animeGrid");
const status = document.querySelector("#status");
const heroCount = document.querySelector("#heroCount");
const heroDescription = document.querySelector("#heroDescription");

async function initPage() {
  clearGrid(grid);
  renderStatus(status, "Lade lokale Snapshot-Daten...", "info");

  try {
    const response = await fetch("/data/top10-2026.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Snapshot not found");
    }

    const payload = await response.json();
    const animeList = payload.items ?? [];
    renderAnimeCards(grid, animeList);
    heroCount.textContent = String(animeList.length);

    if (animeList.length === 0) {
      heroDescription.textContent = "Keine passenden Titel gefunden.";
      renderStatus(status, "Keine First-Season Titel verfuegbar.", "warn");
      return;
    }

    const generatedAt = payload.generatedAt
      ? new Date(payload.generatedAt).toLocaleString("de-DE")
      : "unbekannt";
    heroDescription.textContent =
      `Snapshot vom ${generatedAt}. Ranking: 45% MAL, 35% AniList, 20% Kitsu.`;
    renderStatus(status, `${animeList.length} Titel aus lokaler Datei geladen`, "success");
  } catch {
    heroDescription.textContent = "Lokale Daten fehlen. Fuehre 'npm run snapshot' aus.";
    renderStatus(status, "Snapshot-Datei konnte nicht geladen werden.", "error");
  }
}

initPage();
