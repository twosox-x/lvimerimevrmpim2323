import { Router, type IRouter } from "express";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);

if (process.env.DATABASE_URL) {
  const { default: lootRouter } = await import("./loot");
  router.use(lootRouter);
} else {
  router.use((_req, res) => {
    res.status(503).json({
      error: "DATABASE_URL is not configured. Health and readiness routes are available; product API routes require a database.",
    });
  });
}

export default router;
