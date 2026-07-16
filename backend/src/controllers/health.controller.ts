import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export function getHealthStatus(
  _request: Request,
  response: Response,
): void {
  response.status(200).json({
    success: true,
    message: "OpsMate API is running",
    timestamp: new Date().toISOString(),
  });
}

export async function getDatabaseHealthStatus(
  _request: Request,
  response: Response,
): Promise<void> {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw<Array<{ result: number }>>`
      SELECT 1 AS result
    `;

    response.status(200).json({
      success: true,
      message: "Database connection is healthy",
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error";

    console.error("Database health check failed:", error);

    response.status(503).json({
      success: false,
      message: "Database connection is unavailable",
      ...(env.nodeEnv === "development"
        ? { error: errorMessage }
        : {}),
      timestamp: new Date().toISOString(),
    });
  }
}