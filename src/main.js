import { fetchTopAnime, searchAnime } from "./api/jikan.js";
import { state, resetState } from "./state/store.js";
import { appendAnimeCards, clearGrid, renderStatus } from "./ui/render.js";

const grid = document.querySelector("#animeGrid");
const status = document.querySelector("#status");
const loadMoreButton = document.querySelector("#loadMoreButton");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const resetButton = document.querySelector("#resetButton");

function setLoadMoreState() {
  loadMoreButton.disabled = state.loading || !state.hasNextPage;
  loadMoreButton.textContent = state.loading
    ? "Lade..."
    : state.hasNextPage
      ? "Mehr laden"
      : "Ende erreicht";
}

async function loadCurrentPage() {
  if (state.loading || !state.hasNextPage) {
    return;
  }

  state.loading = true;
  setLoadMoreState();
  renderStatus(status, "Lade Anime...", "info");

  try {
    const result =
      state.mode === "search"
        ? await searchAnime(state.query, state.page)
        : await fetchTopAnime(state.page);

    state.items.push(...result.data);
    state.hasNextPage = result.hasNextPage;
    appendAnimeCards(grid, result.data);
    state.page += 1;

    if (state.items.length === 0) {
      renderStatus(status, "Keine Anime gefunden.", "warn");
    } else {
      renderStatus(status, `${state.items.length} Anime geladen`, "success");
    }
  } catch (error) {
    renderStatus(
      status,
      "Fehler beim Laden. Bitte kurz warten und erneut versuchen.",
      "error",
    );
  } finally {
    state.loading = false;
    setLoadMoreState();
  }
}

function resetView(nextState = {}) {
  resetState(nextState);
  clearGrid(grid);
  renderStatus(status, "Bereit", "info");
  setLoadMoreState();
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    renderStatus(status, "Bitte einen Suchbegriff eingeben.", "warn");
    return;
  }

  resetView({ mode: "search", query });
  await loadCurrentPage();
});

resetButton.addEventListener("click", async () => {
  searchInput.value = "";
  resetView({ mode: "top" });
  await loadCurrentPage();
});

loadMoreButton.addEventListener("click", loadCurrentPage);

resetView({ mode: "top" });
loadCurrentPage();
