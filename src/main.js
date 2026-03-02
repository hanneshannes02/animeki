import { clearGrid, renderAnimeCards, renderStatus } from "./ui/render.js";

const grid = document.querySelector("#animeGrid");
const status = document.querySelector("#status");

async function initPage() {
  clearGrid(grid);
  renderStatus(status, "Lade Top 10...", "info");

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

    renderStatus(
      status,
      animeList.length ? `${animeList.length} Titel geladen` : "Keine Titel verfuegbar",
      animeList.length ? "success" : "warn",
    );
  } catch {
    renderStatus(status, "Daten konnten nicht geladen werden.", "error");
  }
}

initPage();
