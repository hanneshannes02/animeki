const params = new URLSearchParams(window.location.search);
const q = (params.get("q") || "").trim().toLowerCase();
const cards = document.querySelectorAll("#intent-cards .card");

if (q && cards.length) {
  cards.forEach((card) => {
    const keywords = card.dataset.keywords || "";
    if (keywords.includes(q)) {
      card.classList.add("highlight");
    }
  });
}
