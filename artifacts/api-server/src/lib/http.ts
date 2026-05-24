import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function asyncRoute(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

export function parseBody<T>(schema: ZodSchema<T>, req: Request): T {
  return schema.parse(req.body);
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Invalid request", details: error.flatten() });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error instanceof Error && error.name === "ConfigError") {
    return res.status(503).json({ error: error.message });
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return res.status(500).json({ error: message });
}

export function normalizeAddress(address: string) {
  return address.trim().toLowerCase();
}

export function nullableEmpty(value: string | null | undefined) {
  return value && value.trim() ? value.trim() : null;
}
