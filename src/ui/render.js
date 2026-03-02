function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getScore(anime) {
  return anime.score ? anime.score.toFixed(1) : "N/A";
}

export function renderStatus(root, text, type = "info") {
  root.className = `status ${type}`;
  root.textContent = text;
}

export function clearGrid(root) {
  root.innerHTML = "";
}

export function renderAnimeCards(root, animeList) {
  const html = animeList
    .map((anime, index) => {
      const title = escapeHtml(anime.title || "Unbekannter Titel");
      const image = anime.images?.jpg?.image_url || "";
      const episodes = anime.episodes ?? "?";
      const year = anime.year ?? "N/A";
      const genres = escapeHtml(
        (anime.genres?.map((genre) => genre.name) ?? []).slice(0, 3).join(" / ") ||
          "Ohne Genre",
      );
      const score = getScore(anime);
      const synopsis = escapeHtml(anime.synopsis || "Keine Beschreibung verfuegbar.");

      return `
        <article class="card">
          <div class="poster-wrap">
            <img class="poster" src="${image}" alt="Poster von ${title}" loading="lazy" />
            <div class="badge">#${index + 1} • ${score}</div>
          </div>
          <div class="card-body">
            <h3 title="${title}">${title}</h3>
            <p class="meta">Jahr ${year} / Folgen ${episodes}</p>
            <p class="genres">${genres}</p>
            <p class="synopsis">${synopsis}</p>
          </div>
        </article>
      `;
    })
    .join("");

  root.innerHTML = html;
}
