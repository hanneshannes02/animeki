import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchTopFirstSeasonAiringAnime2026 } from "../src/api/jikan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "top10-2026.json");

async function run() {
  const items = await fetchTopFirstSeasonAiringAnime2026(10);

  const payload = {
    generatedAt: new Date().toISOString(),
    criteria: {
      year: 2026,
      status: "currently_airing",
      firstSeasonOnly: true,
      limit: 10,
    },
    rankingMethod: {
      aggregate: "45% MAL + 35% AniList + 20% Kitsu",
    },
    sources: ["Jikan/MAL", "AniList", "Kitsu"],
    items,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Snapshot written: ${OUTPUT_FILE}`);
  console.log(`Items: ${items.length}`);
}

run().catch((error) => {
  console.error("Snapshot generation failed.");
  console.error(error);
  process.exitCode = 1;
});
