import { eq } from "drizzle-orm";
import {
  categories,
  creatorProfiles,
  db,
  posts,
  streams,
  subscriptionPlans,
  users,
} from "@workspace/db";

const demoCreators = [
  {
    walletAddress: "0x1000000000000000000000000000000000000001",
    username: "baseboss",
    displayName: "BaseBoss",
    bio: "Ranked grind, Base-native giveaways, and late-night creator talk.",
    channelColor: "#38bdf8",
    categorySlug: "valorant",
    streamTitle: "VALORANT ranked with L00T community queues",
    accessType: "public" as const,
    isLive: true,
  },
  {
    walletAddress: "0x2000000000000000000000000000000000000002",
    username: "chainmage",
    displayName: "ChainMage",
    bio: "MMOs, crypto strategy, and subscriber-only dungeon nights.",
    channelColor: "#a78bfa",
    categorySlug: "world-of-warcraft",
    streamTitle: "Subscriber raid prep and auction house flips",
    accessType: "subscribers" as const,
    isLive: false,
  },
  {
    walletAddress: "0x3000000000000000000000000000000000000003",
    username: "lootlabs",
    displayName: "L00T Labs",
    bio: "Building, shipping, and testing creator tooling live.",
    channelColor: "#4ade80",
    categorySlug: "crypto",
    streamTitle: "Base creator monetization build session",
    accessType: "public" as const,
    isLive: true,
  },
];

async function upsertUser(input: (typeof demoCreators)[number]) {
  const existing = await db.query.users.findFirst({ where: eq(users.walletAddress, input.walletAddress.toLowerCase()) });
  const values = {
    walletAddress: input.walletAddress.toLowerCase(),
    username: input.username,
    displayName: input.displayName,
    avatarUrl: "/PFP.jpg",
    role: "creator" as const,
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db.update(users).set(values).where(eq(users.id, existing.id)).returning();
    return updated;
  }

  const [created] = await db.insert(users).values(values).returning();
  return created;
}

async function upsertCreator(input: (typeof demoCreators)[number], userId: string) {
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, input.categorySlug) });
  const existing = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.username, input.username) });
  const values = {
    userId,
    username: input.username,
    displayName: input.displayName,
    bio: input.bio,
    avatarUrl: "/PFP.jpg",
    bannerUrl: "",
    channelColor: input.channelColor,
    primaryCategoryId: category?.id ?? null,
    isLive: input.isLive,
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db.update(creatorProfiles).set(values).where(eq(creatorProfiles.id, existing.id)).returning();
    return updated;
  }

  const [created] = await db.insert(creatorProfiles).values(values).returning();
  return created;
}

async function upsertPlan(creatorId: string) {
  const existing = await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.creatorId, creatorId) });
  const values = {
    creatorId,
    durationDays: 30,
    ethPrice: "0.01",
    lootPrice: "100",
    isActive: true,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(subscriptionPlans).set(values).where(eq(subscriptionPlans.id, existing.id));
    return;
  }

  await db.insert(subscriptionPlans).values(values);
}

async function upsertStream(input: (typeof demoCreators)[number], creatorId: string) {
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, input.categorySlug) });
  const existing = await db.query.streams.findFirst({ where: eq(streams.creatorId, creatorId) });
  const values = {
    creatorId,
    title: input.streamTitle,
    categoryId: category?.id ?? null,
    accessType: input.accessType,
    status: input.isLive ? ("live" as const) : ("offline" as const),
    provider: "stub",
    providerStreamId: `demo_${input.username}`,
    ingestUrl: "rtmp://localhost/live",
    playbackUrl: `https://playback.l00t.tv/demo/${input.username}.m3u8`,
    viewerCount: input.isLive ? Math.floor(120 + Math.random() * 1800) : 0,
    startedAt: input.isLive ? new Date(Date.now() - 45 * 60 * 1000) : null,
    endedAt: null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(streams).set(values).where(eq(streams.id, existing.id));
    return;
  }

  await db.insert(streams).values(values);
}

async function seedPosts(creatorId: string) {
  const existing = await db.query.posts.findFirst({ where: eq(posts.creatorId, creatorId) });
  if (existing) return;

  await db.insert(posts).values([
    {
      creatorId,
      title: "Welcome to my L00T channel",
      content: "Public post seeded for local backend testing.",
      visibility: "public",
    },
    {
      creatorId,
      title: "Subscriber drop",
      content: "Subscriber-only post seeded for access-control testing.",
      visibility: "subscribers",
    },
  ]);
}

for (const creatorInput of demoCreators) {
  const user = await upsertUser(creatorInput);
  const creator = await upsertCreator(creatorInput, user.id);
  await upsertPlan(creator.id);
  await upsertStream(creatorInput, creator.id);
  await seedPosts(creator.id);
}

console.log(`Seeded ${demoCreators.length} demo creators, streams, plans, and posts.`);
