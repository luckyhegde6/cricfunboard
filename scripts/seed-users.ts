// scripts/seed-users.ts

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export async function seedUsers() {
  if (process.env.NODE_ENV !== "development" && process.env.FORCE_SEED !== "true") {
    console.log("Seed script only runs in development or with FORCE_SEED=true");
    return;
  }
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cricket";
  console.log("Connecting to", uri);

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const users = db.collection("users");

    const passwordHash = await bcrypt.hash("password123", 10);

    const dummyUsers = [
      { email: "admin@test.com", role: "admin", name: "Admin User" },
      { email: "captain@test.com", role: "captain", name: "Captain User" },
      {
        email: "vice@test.com",
        role: "vicecaptain",
        name: "Vice Captain User",
      },
      { email: "scorer@test.com", role: "scorer", name: "Scorer User" },
      { email: "user@test.com", role: "user", name: "Regular User" },
      // Additional Captains
      { email: "captain1@test.com", role: "captain", name: "Captain One" },
      { email: "captain2@test.com", role: "captain", name: "Captain Two" },
      { email: "captain3@test.com", role: "captain", name: "Captain Three" },
      { email: "captain4@test.com", role: "captain", name: "Captain Four" },
      { email: "captain5@test.com", role: "captain", name: "Captain Five" },
      // Additional Vice Captains
      { email: "vice1@test.com", role: "vicecaptain", name: "Vice One" },
      { email: "vice2@test.com", role: "vicecaptain", name: "Vice Two" },
      { email: "vice3@test.com", role: "vicecaptain", name: "Vice Three" },
      { email: "vice4@test.com", role: "vicecaptain", name: "Vice Four" },
      { email: "vice5@test.com", role: "vicecaptain", name: "Vice Five" },
    ];

    for (const u of dummyUsers) {
      const existing = await users.findOne({ email: u.email });
      if (existing) {
        console.log(`User ${u.email} exists. Updating role...`);
        await users.updateOne(
          { _id: existing._id },
          { $set: { role: u.role, name: u.name, passwordHash } },
        );
      } else {
        console.log(`Creating user ${u.email}...`);
        await users.insertOne({
          email: u.email,
          role: u.role,
          name: u.name,
          passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log("Users seeded successfully.");
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedUsers().catch((err) => {
    console.error("Seed users failed:", err);
    process.exit(1);
  });
}
