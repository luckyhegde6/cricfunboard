// lib/logger.ts  (Turbopack-safe, plain JSON logger)
import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  base: { service: "cricket-scoreboard" },
  // No transport property here — avoids bundler resolving pino-pretty
});

export default logger;
