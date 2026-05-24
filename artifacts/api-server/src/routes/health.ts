import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { config } from "../lib/config";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/readiness", (_req, res) => {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const usingLocalSecrets =
    config.nodeEnv !== "production" && (!config.authSecret || !config.encryptionKey);
  const streamingConfigured =
    config.streamProvider === "stub" ||
    (config.streamProvider === "livekit" &&
      Boolean(config.livekit.url && config.livekit.apiKey && config.livekit.secret));
  const paymentsConfigured = Boolean(config.baseRpcUrl && config.lootTokenAddress);

  res.status(databaseConfigured ? 200 : 503).json({
    status: databaseConfigured ? "ready" : "degraded",
    services: {
      database: databaseConfigured ? "configured" : "missing DATABASE_URL",
      auth: config.authSecret ? "configured" : "development fallback",
      encryption: config.encryptionKey ? "configured" : "development fallback",
      streaming: streamingConfigured ? config.streamProvider : `unconfigured ${config.streamProvider}`,
      streamWebhooks: config.streamWebhookSecret ? "configured" : "development fallback",
      payments: paymentsConfigured ? "configured" : "missing Base RPC and/or L00T token",
    },
    warnings: [
      ...(usingLocalSecrets ? ["AUTH_SECRET and ENCRYPTION_KEY must be set outside local development."] : []),
      ...(config.streamProvider === "stub" ? ["STREAM_PROVIDER=stub is for local development only."] : []),
      ...(!config.streamWebhookSecret ? ["STREAM_WEBHOOK_SECRET should be set before provider webhooks are enabled."] : []),
      ...(!paymentsConfigured ? ["Payment verification requires BASE_RPC_URL and L00T_TOKEN_ADDRESS."] : []),
    ],
  });
});

export default router;
