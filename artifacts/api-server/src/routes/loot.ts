import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  categories,
  chatMessages,
  creatorProfiles,
  donations,
  posts,
  streams,
  subscriptionPlans,
  subscriptions,
  users,
  db,
  publicUsernameSchema,
} from "@workspace/db";
import { asyncRoute, HttpError, normalizeAddress, parseBody } from "../lib/http";
import {
  createNonce,
  createSession,
  destroySession,
  getSessionUser,
  requireUser,
  verifyWalletSignature,
} from "../lib/auth";
import { decryptSecret, encryptSecret } from "../lib/stream-crypto";
import { getStreamProvider } from "../lib/stream-provider";
import { verifyBasePayment } from "../lib/payments";
import { config } from "../lib/config";

const router: IRouter = Router();

const authLimiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });
const chatLimiter = rateLimit({ windowMs: 10_000, limit: 8, standardHeaders: true, legacyHeaders: false });
const paymentLimiter = rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: true, legacyHeaders: false });

const walletSchema = z.object({ walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) });
const verifySchema = walletSchema.extend({ signature: z.string().min(20) });
const profileSchema = z.object({
  username: publicUsernameSchema.optional(),
  displayName: z.string().trim().min(1).max(80).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(800).optional(),
});
const creatorSchema = z.object({
  username: publicUsernameSchema,
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().max(800).default(""),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  channelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#38bdf8"),
  primaryCategoryId: z.string().uuid().optional(),
});
const streamSchema = z.object({
  title: z.string().trim().min(1).max(140),
  categoryId: z.string().uuid().optional(),
  accessType: z.enum(["public", "subscribers"]).default("public"),
});
const postSchema = z.object({
  title: z.string().trim().max(140).optional(),
  content: z.string().trim().min(1).max(5000),
  visibility: z.enum(["public", "subscribers"]).default("public"),
  mediaUrl: z.string().url().optional().or(z.literal("")),
});
const chatSchema = z.object({ message: z.string().trim().min(1).max(500) });
const donationVerifySchema = z.object({
  creatorUsername: publicUsernameSchema,
  streamId: z.string().uuid().optional(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  token: z.enum(["ETH", "L00T"]),
  amount: z.string().min(1),
  message: z.string().max(300).optional(),
});
const subscriptionVerifySchema = z.object({
  creatorUsername: publicUsernameSchema,
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  paymentToken: z.enum(["ETH", "L00T"]),
});

async function currentUserPayload(req: Parameters<typeof getSessionUser>[0]) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  return { ...user, creatorProfile: creator ?? null };
}

async function requireCreator(req: Parameters<typeof requireUser>[0]) {
  const user = await requireUser(req);
  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  if (!creator) throw new HttpError(403, "Creator profile required");
  return { user, creator };
}

async function hasActiveSubscription(creatorId: string, userId?: string) {
  if (!userId) return false;
  const sub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.creatorId, creatorId),
      eq(subscriptions.subscriberUserId, userId),
      eq(subscriptions.status, "active"),
      gte(subscriptions.expiresAt, new Date()),
    ),
  });
  return !!sub;
}

async function getCreatorByUsername(username: string) {
  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.username, username),
  });
  if (!creator) throw new HttpError(404, "Creator not found");
  return creator;
}

function publicStream(stream: typeof streams.$inferSelect) {
  return { ...stream, streamKeyEncrypted: undefined };
}

function routeParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string") throw new HttpError(400, `${name} is required`);
  return value;
}

router.post(
  "/auth/nonce",
  authLimiter,
  asyncRoute(async (req, res) => {
    const { walletAddress } = parseBody(walletSchema, req);
    const nonce = await createNonce(walletAddress);
    res.json({ nonce: nonce.nonce, message: nonce.message });
  }),
);

router.post(
  "/auth/verify",
  authLimiter,
  asyncRoute(async (req, res) => {
    const { walletAddress, signature } = parseBody(verifySchema, req);
    const user = await verifyWalletSignature(walletAddress, signature);
    await createSession(res, user);
    res.json({ user: await currentUserPayload(req) });
  }),
);

router.post(
  "/auth/logout",
  asyncRoute(async (req, res) => {
    await destroySession(req, res);
    res.json({ ok: true });
  }),
);

router.get(
  "/auth/me",
  asyncRoute(async (req, res) => {
    res.json({ user: await currentUserPayload(req) });
  }),
);

router.get("/me", asyncRoute(async (req, res) => res.json({ user: await currentUserPayload(req) })));

router.patch(
  "/me",
  asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    const body = parseBody(profileSchema, req);
    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
    res.json({ user: updated });
  }),
);

router.get(
  "/categories",
  asyncRoute(async (_req, res) => {
    const rows = await db.query.categories.findMany({
      where: eq(categories.isApproved, true),
      orderBy: [categories.sortOrder, categories.name],
    });
    res.json({ categories: rows });
  }),
);

router.get(
  "/creators",
  asyncRoute(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const rows = await db
      .select()
      .from(creatorProfiles)
      .where(q ? or(ilike(creatorProfiles.username, `%${q}%`), ilike(creatorProfiles.displayName, `%${q}%`)) : undefined)
      .orderBy(desc(creatorProfiles.isLive), creatorProfiles.displayName)
      .limit(100);
    res.json({ creators: rows });
  }),
);

router.get(
  "/creators/:username",
  asyncRoute(async (req, res) => {
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const current = await getSessionUser(req);
    const subscribed = await hasActiveSubscription(creator.id, current?.id);
    res.json({ creator, viewer: { isOwner: current?.id === creator.userId, subscribed } });
  }),
);

router.post(
  "/creators",
  asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    const body = parseBody(creatorSchema, req);
    const [creator] = await db
      .insert(creatorProfiles)
      .values({ ...body, userId: user.id })
      .returning();
    await db.update(users).set({ role: "creator", username: body.username, displayName: body.displayName }).where(eq(users.id, user.id));
    await db.insert(subscriptionPlans).values({
      creatorId: creator.id,
      lootTokenAddress: config.lootTokenAddress || null,
    });
    res.status(201).json({ creator });
  }),
);

router.patch(
  "/creators/me",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const body = parseBody(creatorSchema.partial(), req);
    const [updated] = await db
      .update(creatorProfiles)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(creatorProfiles.id, creator.id))
      .returning();
    res.json({ creator: updated });
  }),
);

router.get(
  "/streams",
  asyncRoute(async (req, res) => {
    const status = req.query.status === "live" ? "live" : undefined;
    const rows = await db.query.streams.findMany({
      where: status ? eq(streams.status, status) : undefined,
      orderBy: [desc(streams.viewerCount), desc(streams.createdAt)],
      limit: 100,
    });
    res.json({ streams: rows.map(publicStream) });
  }),
);

router.get(
  "/streams/:id",
  asyncRoute(async (req, res) => {
    const stream = await db.query.streams.findFirst({ where: eq(streams.id, routeParam(req.params.id, "id")) });
    if (!stream) throw new HttpError(404, "Stream not found");
    const current = await getSessionUser(req);
    const subscribed = await hasActiveSubscription(stream.creatorId, current?.id);
    if (stream.accessType === "subscribers" && !subscribed) {
      return res.json({ stream: { ...publicStream(stream), playbackUrl: null }, locked: true });
    }
    return res.json({ stream: publicStream(stream), locked: false });
  }),
);

router.post(
  "/streams",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const body = parseBody(streamSchema, req);
    const provision = await getStreamProvider().provision({ creatorId: creator.id, username: creator.username });
    const [stream] = await db
      .insert(streams)
      .values({
        ...body,
        creatorId: creator.id,
        provider: provision.provider,
        providerStreamId: provision.providerStreamId,
        ingestUrl: provision.ingestUrl,
        playbackUrl: provision.playbackUrl,
        streamKeyEncrypted: encryptSecret(provision.streamKey),
      })
      .returning();
    res.status(201).json({ stream: { ...stream, streamKey: provision.streamKey, streamKeyEncrypted: undefined } });
  }),
);

router.patch(
  "/streams/:id",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const stream = await db.query.streams.findFirst({ where: eq(streams.id, routeParam(req.params.id, "id")) });
    if (!stream || stream.creatorId !== creator.id) throw new HttpError(404, "Stream not found");
    const body = parseBody(streamSchema.partial(), req);
    const [updated] = await db.update(streams).set({ ...body, updatedAt: new Date() }).where(eq(streams.id, stream.id)).returning();
    res.json({ stream: publicStream(updated) });
  }),
);

router.post(
  "/streams/:id/start",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const [stream] = await db
      .update(streams)
      .set({ status: "live", startedAt: new Date(), endedAt: null, updatedAt: new Date() })
      .where(and(eq(streams.id, routeParam(req.params.id, "id")), eq(streams.creatorId, creator.id)))
      .returning();
    await db.update(creatorProfiles).set({ isLive: true }).where(eq(creatorProfiles.id, creator.id));
    res.json({ stream: publicStream(stream) });
  }),
);

router.post(
  "/streams/:id/end",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const [stream] = await db
      .update(streams)
      .set({ status: "ended", endedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(streams.id, routeParam(req.params.id, "id")), eq(streams.creatorId, creator.id)))
      .returning();
    await db.update(creatorProfiles).set({ isLive: false }).where(eq(creatorProfiles.id, creator.id));
    res.json({ stream: publicStream(stream) });
  }),
);

router.post(
  "/streams/:id/regenerate-key",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const stream = await db.query.streams.findFirst({ where: eq(streams.id, routeParam(req.params.id, "id")) });
    if (!stream || stream.creatorId !== creator.id) throw new HttpError(404, "Stream not found");
    const provision = await getStreamProvider().regenerate({ creatorId: creator.id, username: creator.username });
    const [updated] = await db
      .update(streams)
      .set({
        provider: provision.provider,
        providerStreamId: provision.providerStreamId,
        ingestUrl: provision.ingestUrl,
        playbackUrl: provision.playbackUrl,
        streamKeyEncrypted: encryptSecret(provision.streamKey),
        updatedAt: new Date(),
      })
      .where(eq(streams.id, stream.id))
      .returning();
    res.json({ stream: { ...updated, streamKey: provision.streamKey, streamKeyEncrypted: undefined } });
  }),
);

router.get(
  "/creators/:username/live",
  asyncRoute(async (req, res) => {
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const stream = await db.query.streams.findFirst({
      where: and(eq(streams.creatorId, creator.id), eq(streams.status, "live")),
    });
    res.json({ stream: stream ? publicStream(stream) : null });
  }),
);

router.get(
  "/creators/:username/posts",
  asyncRoute(async (req, res) => {
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const current = await getSessionUser(req);
    const subscribed = await hasActiveSubscription(creator.id, current?.id);
    const rows = await db.query.posts.findMany({
      where: eq(posts.creatorId, creator.id),
      orderBy: [desc(posts.createdAt)],
    });
    res.json({
      posts: rows.map((post) =>
        post.visibility === "subscribers" && !subscribed && current?.id !== creator.userId
          ? { ...post, content: null, mediaUrl: null, locked: true }
          : { ...post, locked: false },
      ),
      subscribed,
    });
  }),
);

router.post(
  "/posts",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const body = parseBody(postSchema, req);
    const [post] = await db.insert(posts).values({ ...body, creatorId: creator.id }).returning();
    res.status(201).json({ post });
  }),
);

router.patch(
  "/posts/:id",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const body = parseBody(postSchema.partial(), req);
    const [post] = await db.update(posts).set({ ...body, updatedAt: new Date() }).where(and(eq(posts.id, routeParam(req.params.id, "id")), eq(posts.creatorId, creator.id))).returning();
    res.json({ post });
  }),
);

router.delete(
  "/posts/:id",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    await db.delete(posts).where(and(eq(posts.id, routeParam(req.params.id, "id")), eq(posts.creatorId, creator.id)));
    res.json({ ok: true });
  }),
);

router.get(
  "/streams/:id/chat",
  asyncRoute(async (req, res) => {
    const rows = await db.query.chatMessages.findMany({
      where: eq(chatMessages.streamId, routeParam(req.params.id, "id")),
      orderBy: [desc(chatMessages.createdAt)],
      limit: 100,
    });
    res.json({ messages: rows.reverse() });
  }),
);

router.post(
  "/streams/:id/chat",
  chatLimiter,
  asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    const body = parseBody(chatSchema, req);
    const stream = await db.query.streams.findFirst({ where: eq(streams.id, routeParam(req.params.id, "id")) });
    if (!stream) throw new HttpError(404, "Stream not found");
    const subscribed = await hasActiveSubscription(stream.creatorId, user.id);
    if (stream.accessType === "subscribers" && !subscribed) throw new HttpError(403, "Subscriber-only chat");
    const [message] = await db
      .insert(chatMessages)
      .values({ streamId: stream.id, creatorId: stream.creatorId, userId: user.id, message: body.message })
      .returning();
    req.app.get("broadcastChat")?.(stream.id, message);
    res.status(201).json({ message });
  }),
);

router.post(
  "/donations/verify",
  paymentLimiter,
  asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    const body = parseBody(donationVerifySchema, req);
    const creator = await getCreatorByUsername(body.creatorUsername);
    const creatorUser = await db.query.users.findFirst({ where: eq(users.id, creator.userId) });
    if (!creatorUser) throw new HttpError(404, "Creator wallet not found");
    const verified = await verifyBasePayment({
      txHash: body.txHash,
      from: user.walletAddress,
      to: creatorUser.walletAddress,
      token: body.token,
      minimumAmount: body.amount,
      tokenAddress: body.token === "L00T" ? config.lootTokenAddress : undefined,
    });
    const [donation] = await db
      .insert(donations)
      .values({
        creatorId: creator.id,
        streamId: body.streamId,
        donorUserId: user.id,
        donorWallet: user.walletAddress,
        tokenType: body.token === "ETH" ? "ETH" : "ERC20",
        tokenAddress: body.token === "L00T" ? config.lootTokenAddress : null,
        tokenSymbol: body.token,
        amount: verified.amount,
        txHash: body.txHash,
        chainId: verified.chainId,
        status: "confirmed",
        confirmedAt: new Date(),
      })
      .returning();
    res.status(201).json({ donation });
  }),
);

router.get(
  "/creators/:username/donations",
  asyncRoute(async (req, res) => {
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const { creator: owner } = await requireCreator(req);
    if (owner.id !== creator.id) throw new HttpError(403, "Not your donation ledger");
    const rows = await db.query.donations.findMany({ where: eq(donations.creatorId, creator.id), orderBy: [desc(donations.createdAt)] });
    res.json({ donations: rows });
  }),
);

router.get(
  "/streams/:id/donations",
  asyncRoute(async (req, res) => {
    const rows = await db.query.donations.findMany({ where: eq(donations.streamId, routeParam(req.params.id, "id")), orderBy: [desc(donations.createdAt)] });
    res.json({ donations: rows });
  }),
);

router.get(
  "/creators/:username/subscription-status",
  asyncRoute(async (req, res) => {
    const current = await getSessionUser(req);
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const active = await hasActiveSubscription(creator.id, current?.id);
    const plan = await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.creatorId, creator.id) });
    res.json({ active, plan });
  }),
);

router.post(
  "/subscriptions/verify",
  paymentLimiter,
  asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    const body = parseBody(subscriptionVerifySchema, req);
    const creator = await getCreatorByUsername(body.creatorUsername);
    const creatorUser = await db.query.users.findFirst({ where: eq(users.id, creator.userId) });
    const plan = await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.creatorId, creator.id) });
    if (!creatorUser || !plan) throw new HttpError(404, "Creator subscription plan not found");
    const minimumAmount = body.paymentToken === "ETH" ? plan.ethPrice : plan.lootPrice;
    const verified = await verifyBasePayment({
      txHash: body.txHash,
      from: user.walletAddress,
      to: creatorUser.walletAddress,
      token: body.paymentToken,
      minimumAmount,
      tokenAddress: body.paymentToken === "L00T" ? config.lootTokenAddress : undefined,
    });
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        creatorId: creator.id,
        subscriberUserId: user.id,
        subscriberWallet: user.walletAddress,
        paymentToken: body.paymentToken,
        tokenAddress: body.paymentToken === "L00T" ? config.lootTokenAddress : null,
        amount: verified.amount,
        txHash: body.txHash,
        startsAt,
        expiresAt,
        status: "active",
      })
      .returning();
    res.status(201).json({ subscription });
  }),
);

router.get(
  "/me/subscriptions",
  asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    const rows = await db.query.subscriptions.findMany({
      where: eq(subscriptions.subscriberUserId, user.id),
      orderBy: [desc(subscriptions.createdAt)],
    });
    res.json({ subscriptions: rows });
  }),
);

router.get(
  "/creators/:username/subscribers",
  asyncRoute(async (req, res) => {
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const { creator: owner } = await requireCreator(req);
    if (owner.id !== creator.id) throw new HttpError(403, "Not your subscriber list");
    const rows = await db.query.subscriptions.findMany({ where: eq(subscriptions.creatorId, creator.id) });
    res.json({ subscribers: rows });
  }),
);

router.get(
  "/creators/:username/stats",
  asyncRoute(async (req, res) => {
    const creator = await getCreatorByUsername(routeParam(req.params.username, "username"));
    const [stats] = await db
      .select({
        donationCount: sql<number>`count(distinct ${donations.id})`,
        subscriberCount: sql<number>`count(distinct ${subscriptions.id})`,
      })
      .from(creatorProfiles)
      .leftJoin(donations, eq(donations.creatorId, creatorProfiles.id))
      .leftJoin(subscriptions, and(eq(subscriptions.creatorId, creatorProfiles.id), eq(subscriptions.status, "active")))
      .where(eq(creatorProfiles.id, creator.id));
    res.json({ stats });
  }),
);

router.get(
  "/streams/:id/stats",
  asyncRoute(async (req, res) => {
    const stream = await db.query.streams.findFirst({ where: eq(streams.id, routeParam(req.params.id, "id")) });
    if (!stream) throw new HttpError(404, "Stream not found");
    res.json({ stats: { viewerCount: stream.viewerCount, status: stream.status, startedAt: stream.startedAt, endedAt: stream.endedAt } });
  }),
);

router.get(
  "/creator-stream-key/:streamId",
  asyncRoute(async (req, res) => {
    const { creator } = await requireCreator(req);
    const stream = await db.query.streams.findFirst({ where: eq(streams.id, routeParam(req.params.streamId, "streamId")) });
    if (!stream || stream.creatorId !== creator.id) throw new HttpError(404, "Stream not found");
    res.json({ ingestUrl: stream.ingestUrl, streamKey: decryptSecret(stream.streamKeyEncrypted) });
  }),
);

export default router;
