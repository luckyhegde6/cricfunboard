// scripts/seed-scorer.ts

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cricket";
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const users = db.collection("users");

    const email = "scorer@test.com";
    const passwordHash = await bcrypt.hash("password123", 10);

    const existing = await users.findOne({ email });
    if (existing) {
      console.log("Scorer exists, updating...");
      await users.updateOne(
        { _id: existing._id },
        { $set: { role: "scorer", passwordHash } },
      );
    } else {
      console.log("Creating scorer...");
      await users.insertOne({
        email,
        role: "scorer",
        name: "Scorer User",
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log("Scorer seeded.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Seed scorer failed:", err);
  process.exit(1);
});
