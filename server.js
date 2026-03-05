const express = require("express");
const path = require("path");
const animeList = require("./data/anime");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {
    animeList,
    seo: {
      title: "Anime aehnlich wie One Piece: Top 10 Empfehlungen | AnimeKI",
      description:
        "Moderne Dark-Mode-Webseite mit Top-10 Anime aehnlich wie One Piece, grossen Bildern und starken Kurzbeschreibungen.",
      url: `${BASE_URL}/`,
      image:
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg"
    }
  });
});

app.listen(PORT, () => {
  console.log(`AnimeKI Node.js server running on http://localhost:${PORT}`);
});
