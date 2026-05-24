import crypto from "node:crypto";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { verifyMessage } from "ethers";
import { db, users, authSessions, type User } from "@workspace/db";
import { authSecret, config } from "./config";
import { HttpError, normalizeAddress } from "./http";

const COOKIE_NAME = "loot_session";
const SESSION_DAYS = 30;

type TokenPayload = {
  sessionId: string;
  userId: string;
  exp: number;
};

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string) {
  return crypto.createHmac("sha256", authSecret()).update(data).digest("base64url");
}

function encodeToken(payload: TokenPayload) {
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function decodeToken(token: string): TokenPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) throw new HttpError(401, "Invalid session");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  if (payload.exp < Date.now()) throw new HttpError(401, "Session expired");
  return payload;
}

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function authMessage(walletAddress: string, nonce: string) {
  return [
    "Sign in to L00T.tv",
    "",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `URI: ${config.appUrl}`,
    `Chain ID: ${config.baseChainId}`,
  ].join("\n");
}

export async function createNonce(walletAddress: string) {
  const normalized = normalizeAddress(walletAddress);
  const nonce = crypto.randomBytes(18).toString("base64url");
  const nonceExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const existing = await db.query.users.findFirst({
    where: eq(users.walletAddress, normalized),
  });

  const rows = existing
    ? await db
        .update(users)
        .set({ nonce, nonceExpiresAt, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning()
    : await db
        .insert(users)
        .values({ walletAddress: normalized, nonce, nonceExpiresAt, role: "viewer" })
        .returning();

  return {
    nonce,
    message: authMessage(normalized, nonce),
    user: rows[0],
  };
}

export async function verifyWalletSignature(walletAddress: string, signature: string) {
  const normalized = normalizeAddress(walletAddress);
  const user = await db.query.users.findFirst({ where: eq(users.walletAddress, normalized) });
  if (!user?.nonce || !user.nonceExpiresAt || user.nonceExpiresAt.getTime() < Date.now()) {
    throw new HttpError(401, "Nonce expired");
  }

  const recovered = normalizeAddress(verifyMessage(authMessage(normalized, user.nonce), signature));
  if (recovered !== normalized) throw new HttpError(401, "Signature does not match wallet");

  await db.update(users).set({ nonce: null, nonceExpiresAt: null, updatedAt: new Date() }).where(eq(users.id, user.id));
  return user;
}

export async function createSession(res: Response, user: User) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const [session] = await db
    .insert(authSessions)
    .values({
      userId: user.id,
      tokenHash: "pending",
      expiresAt,
    })
    .returning();
  const token = encodeToken({ sessionId: session.id, userId: user.id, exp: expiresAt.getTime() });
  await db.update(authSessions).set({ tokenHash: tokenHash(token) }).where(eq(authSessions.id, session.id));
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.nodeEnv === "production" || config.cookieSameSite === "none",
    domain: config.cookieDomain || undefined,
    expires: expiresAt,
    path: "/",
  });
  return token;
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = decodeToken(token);
      await db.delete(authSessions).where(eq(authSessions.id, payload.sessionId));
    } catch {
      // Ignore invalid logout tokens.
    }
  }
  res.clearCookie(COOKIE_NAME, { path: "/", domain: config.cookieDomain || undefined });
}

export async function getSessionUser(req: Request) {
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const payload = decodeToken(token);
  const session = await db.query.authSessions.findFirst({ where: eq(authSessions.id, payload.sessionId) });
  if (!session || session.tokenHash !== tokenHash(token) || session.expiresAt.getTime() < Date.now()) {
    throw new HttpError(401, "Invalid session");
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
  return user ?? null;
}

export async function requireUser(req: Request) {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError(401, "Authentication required");
  return user;
}
