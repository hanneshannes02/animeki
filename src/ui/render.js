function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function score(value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "k.A.";
  }
  return `${Number(value).toFixed(1)}${suffix}`;
}

function link(label, href) {
  if (!href) {
    return `<span>${label}: nicht verfuegbar</span>`;
  }
  return `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
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
      const native = anime.titleNative ? escapeHtml(anime.titleNative) : null;
      const genres = escapeHtml((anime.genres ?? []).join(" / ") || "Keine Genres");
      const synopsis = escapeHtml(anime.synopsis || "Keine Beschreibung verfuegbar.");
      const studio = escapeHtml(anime.studio || "Unbekannt");
      const year = anime.year ?? "k.A.";
      const episodes = anime.episodes ?? "k.A.";

      return `
        <article class="card-row">
          <div class="poster-wrap">
            <img class="poster" src="${anime.image}" alt="${title}" loading="lazy" />
            <div class="rank">#${index + 1}</div>
          </div>
          <div class="card-body">
            <h3>${title}</h3>
            ${native ? `<p class="native">${native}</p>` : ""}
            <p class="meta">Jahr ${year} / Folgen ${episodes} / Studio ${studio}</p>
            <p class="genres">${genres}</p>
            <p class="scores">
              Gesamt ${score(anime.aggregateScore)} | MAL ${score(anime.malScore)} |
              AniList ${score(anime.anilistScore)} | Kitsu ${score(anime.kitsuScore)}
            </p>
            <p class="synopsis">${synopsis}</p>
            <div class="links">
              ${link("Jetzt ansehen", anime.watchUrl)}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  root.innerHTML = html;
}
