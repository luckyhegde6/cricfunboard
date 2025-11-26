// scripts/seed-admin.ts
/**
 * Tiny seed script to create an admin user in MongoDB.
 * Usage:
 *   npm install -D ts-node typescript @types/node
 *   ADMIN_EMAIL=admin@local ADMIN_PASSWORD=password123 ts-node ./scripts/seed-admin.ts
 *
 * The script reads:
 *  - MONGODB_URI (from env) or defaults to mongodb://127.0.0.1:27017/cricket
 *  - ADMIN_EMAIL (required)
 *  - ADMIN_PASSWORD (optional; defaults to "password123")
 *
 * It is idempotent: if user exists, it updates role to "admin" and optionally updates password.
 */

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export async function seedAdmin() {
  if (process.env.NODE_ENV !== "development" && process.env.FORCE_SEED !== "true") {
    console.log("Seed script only runs in development or with FORCE_SEED=true");
    return; // Changed from process.exit(0) to return to allow sequence to continue or stop gracefully
  }
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cricket";
  const email = process.env.ADMIN_EMAIL || "luckyhegdedev@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "password123";

  if (!email) {
    console.error("Please set ADMIN_EMAIL environment variable.");
    process.exit(1);
  }

  console.log("Connecting to", uri);
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(); // Uses DB name from URI or default
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      console.log(
        "User exists — updating role to admin and password hash (if changed).",
      );
      await users.updateOne(
        { _id: existing._id },
        { $set: { role: "admin", passwordHash } },
      );
      console.log("Updated existing user:", email);
    } else {
      const res = await users.insertOne({
        email,
        passwordHash,
        role: "admin",
        createdAt: new Date(),
      });
      console.log("Inserted admin user id:", res.insertedId.toString());
    }
    console.log("Done. You can now sign in with:", email);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedAdmin().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
