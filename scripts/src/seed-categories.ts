import { db, categories } from "@workspace/db";
import { eq } from "drizzle-orm";

const games = [
  ["league-of-legends", "League of Legends", "The most-played PC game on the planet.", "/category-gifs/league.webm", "#c89b3c", 1],
  ["counter-strike-2", "Counter-Strike 2", "The classic FPS, evolved.", "", "#f59e0b", 2],
  ["gta-v", "Grand Theft Auto V / GTA RP", "Open world, roleplay, and mayhem.", "/category-gifs/gta.webm", "#22d3ee", 3],
  ["valorant", "VALORANT", "Tactical 5v5 shooter from Riot Games.", "/category-gifs/valorant.webm", "#ff4655", 4],
  ["dota-2", "Dota 2", "The deepest strategy game ever made.", "/category-gifs/dota.webm", "#a3e635", 5],
  ["fortnite", "Fortnite", "Battle royale and creative mode.", "/category-gifs/fortnite.webm", "#60a5fa", 6],
  ["minecraft", "Minecraft", "Speedruns, survival, and creative builds.", "/category-gifs/minecraft.webm", "#4ade80", 7],
  ["world-of-warcraft", "World of Warcraft", "The legendary MMORPG.", "/category-gifs/wow.webm", "#f59e0b", 8],
  ["apex-legends", "Apex Legends", "Battle royale on the Frontier.", "/category-gifs/apex.webm", "#f97316", 9],
  ["call-of-duty", "Call of Duty", "Warzone, ranked, and beyond.", "/category-gifs/call-od-duty.webm", "#84cc16", 10],
  ["ea-sports-fc", "EA Sports FC", "Football at the highest level.", "/category-gifs/fifa.webm", "#10b981", 11],
  ["pubg", "PUBG: Battlegrounds", "The original battle royale.", "/category-gifs/pubg.webm", "#fbbf24", 12],
  ["pubg-mobile", "PUBG Mobile", "Battle royale on mobile.", "", "#f59e0b", 13],
  ["overwatch-2", "Overwatch 2", "Hero shooter from Blizzard.", "/category-gifs/overwatch.webm", "#f97316", 14],
  ["rust", "Rust", "Survival, raiding, and chaos.", "/category-gifs/rust.webm", "#ef4444", 15],
  ["escape-from-tarkov", "Escape from Tarkov", "Hardcore tactical shooter.", "/category-gifs/escape-from-tarkov.webm", "#6b7280", 16],
  ["rocket-league", "Rocket League", "Cars plus football at impossible speed.", "/category-gifs/rocket-league.webm", "#3b82f6", 17],
  ["roblox", "Roblox", "The platform for all genres.", "", "#e11d48", 18],
  ["dead-by-daylight", "Dead by Daylight", "Asymmetric horror survival.", "/category-gifs/dead-by-daylight.webm", "#dc2626", 19],
  ["street-fighter-6", "Street Fighter 6", "The new era of fighting games.", "", "#f43f5e", 20],
  ["irl", "IRL", "Real life streaming.", "", "#f472b6", 30],
  ["crypto", "Crypto Trading", "Live charts and trading setups.", "", "#22c55e", 31],
  ["music-arts", "Music & Arts", "Live sets, visual art, and performances.", "", "#c084fc", 32],
] as const;

for (const [slug, name, description, mediaUrl, accentColor, sortOrder] of games) {
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  const values = {
    slug,
    name,
    type: slug === "irl" || slug === "crypto" || slug === "music-arts" ? ("topic" as const) : ("game" as const),
    description,
    parentSlug: slug === "irl" || slug === "crypto" || slug === "music-arts" ? null : "games",
    mediaUrl,
    gifUrl: mediaUrl,
    videoUrl: mediaUrl,
    accentColor,
    sortOrder,
    isApproved: true,
  };
  if (existing) {
    await db.update(categories).set({ ...values, updatedAt: new Date() }).where(eq(categories.id, existing.id));
  } else {
    await db.insert(categories).values(values);
  }
}

console.log(`Seeded ${games.length} L00T.tv categories.`);
