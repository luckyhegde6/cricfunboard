// scripts/seed-matchData.ts

import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export async function seedMatchData() {
  if (process.env.NODE_ENV !== "development" && process.env.FORCE_SEED !== "true") {
    console.log("Seed script only runs in development or with FORCE_SEED=true");
    return;
  }
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cricket";
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const matches = db.collection("matches");

    const users = db.collection("users");
    const scorer = await users.findOne({ email: "scorer@test.com" });
    const captain = await users.findOne({ email: "captain@test.com" });
    const viceCaptain = await users.findOne({ email: "vice@test.com" });

    // Create a dummy match
    const match = {
      name: "Friendly Match",
      teamA: "Team A",
      teamB: "Team B",
      venue: "Local Ground",
      startTime: new Date(),
      status: "scheduled",
      maxOvers: 20,
      scorerId: scorer?._id,
      captainId: captain?._id,
      viceCaptainId: viceCaptain?._id,
      summary: {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
      },
      recentEvents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await matches.insertOne(match);
    console.log("Seeded dummy match.");

    // Completed Match
    const completedMatch = {
      name: "Championship Final",
      teamA: "Team A",
      teamB: "Team B",
      venue: "Grand Stadium",
      startTime: new Date(Date.now() - 86400000), // Yesterday
      status: "completed",
      maxOvers: 20,
      scorerId: scorer?._id,
      captainId: captain?._id,
      viceCaptainId: viceCaptain?._id,
      toss: {
        winner: "Team A",
        decision: "bat",
        completedAt: new Date(Date.now() - 86400000),
      },
      battingTeam: "Team B",
      bowlingTeam: "Team A",
      currentInnings: 2,
      innings1Summary: {
        runs: 180,
        wickets: 4,
        overs: 20,
        balls: 120,
        dismissedBatters: ["P002", "P003"],
      },
      innings2Summary: {
        runs: 165,
        wickets: 8,
        overs: 20,
        balls: 120,
        dismissedBatters: ["P101", "P102", "P103"],
      },
      matchState: "completed",
      result: "Team A won by 15 runs",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await matches.insertOne(completedMatch);
    console.log("Seeded completed match.");

    // Live Match
    const liveMatch = {
      name: "Live League Match",
      teamA: "Team C",
      teamB: "Team D",
      venue: "City Oval",
      startTime: new Date(),
      status: "live",
      maxOvers: 20,
      scorerId: scorer?._id,
      toss: {
        winner: "Team C",
        decision: "bowl",
        completedAt: new Date(),
      },
      battingTeam: "Team D",
      bowlingTeam: "Team C",
      currentInnings: 1,
      innings1Summary: {
        runs: 45,
        wickets: 1,
        overs: 5,
        balls: 30,
        dismissedBatters: [],
      },
      matchState: "live",
      currentBatters: {
        striker: "Team D Player 1",
        nonStriker: "Team D Player 2",
      },
      currentBowler: "Team C Player 8",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await matches.insertOne(liveMatch);
    console.log("Seeded live match.");

    // Scheduled Matches
    const scheduledMatches = [
      { tA: "Team E", tB: "Team F", venue: "Park Ground" },
      { tA: "Team G", tB: "Team A", venue: "School Field" },
    ];

    for (const m of scheduledMatches) {
      await matches.insertOne({
        name: "League Match",
        teamA: m.tA,
        teamB: m.tB,
        venue: m.venue,
        startTime: new Date(Date.now() + 86400000 * 2), // 2 days later
        status: "scheduled",
        maxOvers: 20,
        scorerId: scorer?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log("Seeded scheduled matches.");
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedMatchData().catch((err) => {
    console.error("Seed match data failed:", err);
    process.exit(1);
  });
}
