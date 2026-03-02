import { fetchTopFirstSeasonAiringAnime2026 } from "./api/jikan.js";
import { clearGrid, renderAnimeCards, renderStatus } from "./ui/render.js";

const grid = document.querySelector("#animeGrid");
const status = document.querySelector("#status");
const heroCount = document.querySelector("#heroCount");
const heroDescription = document.querySelector("#heroDescription");

async function initPage() {
  clearGrid(grid);
  renderStatus(status, "Lade und aggregiere Daten aus mehreren Quellen...", "info");

  try {
    const animeList = await fetchTopFirstSeasonAiringAnime2026(10);
    renderAnimeCards(grid, animeList);
    heroCount.textContent = String(animeList.length);

    if (animeList.length === 0) {
      heroDescription.textContent = "Keine passenden Titel gefunden.";
      renderStatus(status, "Keine First-Season Titel verfuegbar.", "warn");
      return;
    }

    heroDescription.textContent =
      "Ranking: 45% MAL Score, 35% AniList Score, 20% Kitsu Score.";
    renderStatus(status, `${animeList.length} Titel geladen`, "success");
  } catch {
    heroDescription.textContent = "Datenquellen sind gerade nicht erreichbar.";
    renderStatus(status, "Fehler beim Laden der Live-Daten.", "error");
  }
}

initPage();
