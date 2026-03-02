import { fetchTopAiringAnimeForYear } from "./api/jikan.js";
import { clearGrid, renderAnimeCards, renderStatus } from "./ui/render.js";

const TARGET_YEAR = 2026;
const TARGET_LIMIT = 10;

const grid = document.querySelector("#animeGrid");
const status = document.querySelector("#status");
const heroYear = document.querySelector("#heroYear");
const heroCount = document.querySelector("#heroCount");
const heroDescription = document.querySelector("#heroDescription");

async function initPage() {
  clearGrid(grid);
  renderStatus(status, "Lade Top 10 laufende Anime...", "info");

  try {
    const animeList = await fetchTopAiringAnimeForYear(TARGET_YEAR, TARGET_LIMIT);
    renderAnimeCards(grid, animeList);

    heroYear.textContent = String(TARGET_YEAR);
    heroCount.textContent = String(animeList.length);
    heroDescription.textContent =
      "Sortiert nach Score, bei Gleichstand nach Popularitaet.";

    if (animeList.length === 0) {
      renderStatus(status, "Keine passenden laufenden Anime gefunden.", "warn");
      return;
    }

    renderStatus(status, `${animeList.length} Titel geladen`, "success");
  } catch (error) {
    renderStatus(status, "Fehler beim Laden der Anime-Daten.", "error");
    heroDescription.textContent = "API aktuell nicht erreichbar. Bitte spaeter erneut laden.";
  }
}

initPage();
