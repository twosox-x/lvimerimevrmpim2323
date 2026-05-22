import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["viewer", "creator", "admin"]);
export const categoryTypeEnum = pgEnum("category_type", ["game", "topic"]);
export const streamAccessEnum = pgEnum("stream_access", ["public", "subscribers"]);
export const streamStatusEnum = pgEnum("stream_status", ["offline", "live", "ended"]);
export const postVisibilityEnum = pgEnum("post_visibility", ["public", "subscribers"]);
export const chatMessageTypeEnum = pgEnum("chat_message_type", [
  "normal",
  "donation",
  "subscription",
  "system",
]);
export const tokenTypeEnum = pgEnum("token_type", ["ETH", "ERC20"]);
export const paymentTokenEnum = pgEnum("payment_token", ["ETH", "L00T"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "confirmed", "failed"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: text("wallet_address").notNull(),
    username: text("username"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("viewer"),
    nonce: text("nonce"),
    nonceExpiresAt: timestamp("nonce_expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    walletAddressIdx: uniqueIndex("users_wallet_address_idx").on(table.walletAddress),
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
  }),
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    type: categoryTypeEnum("type").notNull().default("game"),
    description: text("description").notNull().default(""),
    parentSlug: text("parent_slug"),
    mediaUrl: text("media_url"),
    gifUrl: text("gif_url"),
    videoUrl: text("video_url"),
    accentColor: text("accent_color").notNull().default("#38bdf8"),
    viewerCount: integer("viewer_count").notNull().default(0),
    liveChannelCount: integer("live_channel_count").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    isApproved: boolean("is_approved").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
  }),
);

export const creatorProfiles = pgTable(
  "creator_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    bio: text("bio").notNull().default(""),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    channelColor: text("channel_color").notNull().default("#38bdf8"),
    primaryCategoryId: uuid("primary_category_id").references(() => categories.id),
    secondaryCategoryIds: jsonb("secondary_category_ids").$type<string[]>().notNull().default([]),
    isLive: boolean("is_live").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    userIdx: uniqueIndex("creator_profiles_user_idx").on(table.userId),
    usernameIdx: uniqueIndex("creator_profiles_username_idx").on(table.username),
  }),
);

export const streams = pgTable(
  "streams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    accessType: streamAccessEnum("access_type").notNull().default("public"),
    status: streamStatusEnum("status").notNull().default("offline"),
    provider: text("provider").notNull().default("stub"),
    providerStreamId: text("provider_stream_id"),
    ingestUrl: text("ingest_url"),
    streamKeyEncrypted: text("stream_key_encrypted"),
    playbackUrl: text("playback_url"),
    viewerCount: integer("viewer_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    creatorIdx: index("streams_creator_idx").on(table.creatorId),
    statusIdx: index("streams_status_idx").on(table.status),
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    visibility: postVisibilityEnum("visibility").notNull().default("public"),
    mediaUrl: text("media_url"),
    ...timestamps,
  },
  (table) => ({
    creatorIdx: index("posts_creator_idx").on(table.creatorId),
  }),
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    streamId: uuid("stream_id").notNull().references(() => streams.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
    type: chatMessageTypeEnum("type").notNull().default("normal"),
    message: text("message").notNull(),
    amount: numeric("amount", { precision: 36, scale: 18 }),
    tokenSymbol: text("token_symbol"),
    txHash: text("tx_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    streamIdx: index("chat_messages_stream_idx").on(table.streamId),
  }),
);

export const donations = pgTable(
  "donations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    streamId: uuid("stream_id").references(() => streams.id, { onDelete: "set null" }),
    creatorId: uuid("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
    donorUserId: uuid("donor_user_id").references(() => users.id, { onDelete: "set null" }),
    donorWallet: text("donor_wallet").notNull(),
    tokenType: tokenTypeEnum("token_type").notNull(),
    tokenAddress: text("token_address"),
    tokenSymbol: text("token_symbol").notNull(),
    amount: numeric("amount", { precision: 36, scale: 18 }).notNull(),
    txHash: text("tx_hash").notNull(),
    chainId: integer("chain_id").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (table) => ({
    txHashIdx: uniqueIndex("donations_tx_hash_idx").on(table.txHash),
    creatorIdx: index("donations_creator_idx").on(table.creatorId),
  }),
);

export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
    durationDays: integer("duration_days").notNull().default(30),
    ethPrice: numeric("eth_price", { precision: 36, scale: 18 }).notNull().default("0.01"),
    lootPrice: numeric("loot_price", { precision: 36, scale: 18 }).notNull().default("100"),
    lootTokenAddress: text("loot_token_address"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    creatorIdx: uniqueIndex("subscription_plans_creator_idx").on(table.creatorId),
  }),
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
    subscriberUserId: uuid("subscriber_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    subscriberWallet: text("subscriber_wallet").notNull(),
    paymentToken: paymentTokenEnum("payment_token").notNull(),
    tokenAddress: text("token_address"),
    amount: numeric("amount", { precision: 36, scale: 18 }).notNull(),
    txHash: text("tx_hash").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    txHashIdx: uniqueIndex("subscriptions_tx_hash_idx").on(table.txHash),
    statusIdx: index("subscriptions_status_idx").on(table.creatorId, table.subscriberUserId, table.status),
  }),
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("auth_sessions_token_hash_idx").on(table.tokenHash),
  }),
);

export const insertUserSchema = createInsertSchema(users);
export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles);
export const insertCategorySchema = createInsertSchema(categories);
export const insertStreamSchema = createInsertSchema(streams);
export const insertPostSchema = createInsertSchema(posts);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertDonationSchema = createInsertSchema(donations);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);

export type User = typeof users.$inferSelect;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Stream = typeof streams.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const publicUsernameSchema = z
  .string()
  .trim()
  .min(2)
  .max(32)
  .regex(/^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/);
