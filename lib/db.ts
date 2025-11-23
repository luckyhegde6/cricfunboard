// lib/db.ts
import mongoose from "mongoose";
import logger from "./logger";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cricket";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Use globalThis to cache the mongoose connection during development so HMR
 * doesn't create multiple connections.
 */
type CachedConn = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as unknown as {
  _mongoose?: CachedConn;
};

let cached: CachedConn = globalWithMongoose._mongoose || {
  conn: null,
  promise: null,
};

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    logger.info({ url: MONGODB_URI }, "Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => {
        logger.info("MongoDB connected");
        return mongooseInstance;
      })
      .catch((err) => {
        logger.error({ err }, "MongoDB connection error");
        throw err;
      });
  }

  cached.conn = await cached.promise;
  globalWithMongoose._mongoose = cached;
  return cached.conn;
}

export default dbConnect;
