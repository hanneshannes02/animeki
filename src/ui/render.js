function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getGenres(anime) {
  const genres = anime.genres?.map((genre) => genre.name) ?? [];
  return genres.slice(0, 3).join(" • ") || "Ohne Genre";
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

export function renderTrending(root, animeList) {
  const items = animeList.slice(0, 8);
  if (items.length === 0) {
    root.innerHTML = "";
    return;
  }

  const html = items
    .map((anime, index) => {
      const title = escapeHtml(anime.title || "Unbekannter Titel");
      const image = anime.images?.jpg?.image_url || "";
      const score = getScore(anime);
      return `
        <article class="trend-card">
          <img src="${image}" alt="${title}" loading="lazy" />
          <div class="trend-overlay">
            <span class="trend-rank">#${index + 1}</span>
            <h3 title="${title}">${title}</h3>
            <p>Score ${score}</p>
          </div>
        </article>
      `;
    })
    .join("");

  root.innerHTML = html;
}

export function appendAnimeCards(root, animeList) {
  const html = animeList
    .map((anime) => {
      const title = escapeHtml(anime.title || "Unbekannter Titel");
      const image = anime.images?.jpg?.image_url || "";
      const episodes = anime.episodes ?? "?";
      const year = anime.year ?? "N/A";
      const genres = escapeHtml(getGenres(anime));
      const score = getScore(anime);

      return `
        <article class="card">
          <div class="poster-wrap">
            <img class="poster" src="${image}" alt="Poster von ${title}" loading="lazy" />
            <div class="badge">★ ${score}</div>
          </div>
          <div class="card-body">
            <h3 title="${title}">${title}</h3>
            <p class="meta">Jahr: ${year} • Folgen: ${episodes}</p>
            <p class="genres">${genres}</p>
          </div>
        </article>
      `;
    })
    .join("");

  root.insertAdjacentHTML("beforeend", html);
}
