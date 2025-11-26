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
        {
          playerId: "P012",
          name: "Axar Patel",
          role: "allrounder",
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
        {
          playerId: "P112",
          name: "Nathan Lyon",
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

    // Helper to generate dummy players
    const generatePlayers = (teamPrefix: string, startId: number) => {
      const roles = ["batsman", "batsman", "batsman", "batsman", "keeper", "allrounder", "allrounder", "bowler", "bowler", "bowler", "bowler", "bowler"];
      return roles.map((role, index) => ({
        playerId: `P${startId + index}`,
        name: `${teamPrefix} Player ${index + 1}`,
        role,
        isCaptain: index === 0,
        isViceCaptain: index === 1,
        isExtra: index >= 11,
      }));
    };

    const newTeams = [
      { name: "Team C", email: "captain1@test.com", viceEmail: "vice1@test.com", startId: 200 },
      { name: "Team D", email: "captain2@test.com", viceEmail: "vice2@test.com", startId: 300 },
      { name: "Team E", email: "captain3@test.com", viceEmail: "vice3@test.com", startId: 400 },
      { name: "Team F", email: "captain4@test.com", viceEmail: "vice4@test.com", startId: 500 },
      { name: "Team G", email: "captain5@test.com", viceEmail: "vice5@test.com", startId: 600 },
    ];

    for (const t of newTeams) {
      const cap = await users.findOne({ email: t.email });
      const vic = await users.findOne({ email: t.viceEmail });

      const teamData = {
        name: t.name,
        captainId: cap?._id,
        viceCaptainId: vic?._id,
        contactEmail: t.email,
        players: generatePlayers(t.name, t.startId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await teams.updateOne(
        { name: t.name },
        { $set: teamData },
        { upsert: true },
      );
      console.log(`Seeded ${t.name}`);
    }
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
