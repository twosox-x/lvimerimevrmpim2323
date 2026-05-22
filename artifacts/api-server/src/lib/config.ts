import crypto from "node:crypto";

export type StreamProviderName = "stub" | "livekit" | "livepeer" | "mux" | "cloudflare";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
  corsOrigin: process.env.CORS_ORIGIN ?? process.env.APP_URL ?? "http://localhost:5173",
  authSecret: process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? "",
  baseRpcUrl: process.env.BASE_RPC_URL ?? "",
  baseChainId: Number(process.env.BASE_CHAIN_ID ?? "8453"),
  lootTokenAddress: process.env.L00T_TOKEN_ADDRESS ?? "",
  streamProvider: (process.env.STREAM_PROVIDER ?? "stub") as StreamProviderName,
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  livekit: {
    url: process.env.LIVEKIT_API_URL ?? process.env.LIVEKIT_URL ?? "",
    apiKey: process.env.LIVEKIT_API_KEY ?? "",
    secret: process.env.LIVEKIT_API_SECRET ?? process.env.LIVEKIT_SECRET ?? "",
  },
};

export function requireRuntimeConfig(keys: Array<keyof typeof config>) {
  const missing = keys.filter((key) => !config[key]);
  if (missing.length) {
    const error = new Error(`Missing required server config: ${missing.join(", ")}`);
    error.name = "ConfigError";
    throw error;
  }
}

export function encryptionKeyBytes() {
  if (!config.encryptionKey) {
    if (config.nodeEnv === "production") {
      throw new Error("ENCRYPTION_KEY is required in production");
    }
    return crypto.createHash("sha256").update("loot-tv-dev-encryption-key").digest();
  }

  if (/^[a-f0-9]{64}$/i.test(config.encryptionKey)) {
    return Buffer.from(config.encryptionKey, "hex");
  }

  return crypto.createHash("sha256").update(config.encryptionKey).digest();
}

export function authSecret() {
  if (!config.authSecret) {
    if (config.nodeEnv === "production") {
      throw new Error("AUTH_SECRET or JWT_SECRET is required in production");
    }
    return "loot-tv-dev-auth-secret";
  }
  return config.authSecret;
}
