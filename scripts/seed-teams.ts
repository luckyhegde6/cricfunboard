// scripts/seed-teams.ts

import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export async function seedTeams() {
  if (process.env.NODE_ENV !== "development" && process.env.FORCE_SEED !== "true") {
    console.log("Seed script only runs in development or with FORCE_SEED=true");
    return;
  }
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cricket";
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const users = db.collection("users");
    const teams = db.collection("teams");

    // Find captain and vice captain
    const captain = await users.findOne({ email: "captain@test.com" });
    const vice = await users.findOne({ email: "vice@test.com" });

    const teamA = {
      name: "Team A",
      captainId: captain?._id,
      viceCaptainId: vice?._id,
      contactEmail: "teama@test.com",
      players: [
        {
          playerId: "P001",
          name: "Virat Kohli",
          role: "batsman",
          isCaptain: true,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P002",
          name: "Rohit Sharma",
          role: "batsman",
          isCaptain: false,
          isViceCaptain: true,
          isExtra: false,
        },
        {
          playerId: "P003",
          name: "Jasprit Bumrah",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P004",
          name: "Ravindra Jadeja",
          role: "allrounder",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P005",
          name: "Rishabh Pant",
          role: "keeper",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P006",
          name: "KL Rahul",
          role: "batsman",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P007",
          name: "Mohammed Shami",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P008",
          name: "Hardik Pandya",
          role: "allrounder",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P009",
          name: "Yuzvendra Chahal",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P010",
          name: "Shubman Gill",
          role: "batsman",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P011",
          name: "Ishan Kishan",
          role: "keeper",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const teamB = {
      name: "Team B",
      contactEmail: "teamb@test.com",
      players: [
        {
          playerId: "P101",
          name: "Steve Smith",
          role: "batsman",
          isCaptain: true,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P102",
          name: "David Warner",
          role: "batsman",
          isCaptain: false,
          isViceCaptain: true,
          isExtra: false,
        },
        {
          playerId: "P103",
          name: "Pat Cummins",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P104",
          name: "Glenn Maxwell",
          role: "allrounder",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P105",
          name: "Alex Carey",
          role: "keeper",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P106",
          name: "Mitchell Starc",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P107",
          name: "Marcus Stoinis",
          role: "allrounder",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P108",
          name: "Adam Zampa",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P109",
          name: "Travis Head",
          role: "batsman",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P110",
          name: "Marnus Labuschagne",
          role: "batsman",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: false,
        },
        {
          playerId: "P111",
          name: "Josh Hazlewood",
          role: "bowler",
          isCaptain: false,
          isViceCaptain: false,
          isExtra: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert Team A
    await teams.updateOne(
      { name: "Team A" },
      { $set: teamA },
      { upsert: true },
    );
    console.log("Seeded Team A");

    // Upsert Team B
    await teams.updateOne(
      { name: "Team B" },
      { $set: teamB },
      { upsert: true },
    );
    console.log("Seeded Team B");
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedTeams().catch((err) => {
    console.error("Seed teams failed:", err);
    process.exit(1);
  });
}
