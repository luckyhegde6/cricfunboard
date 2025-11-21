// scripts/seed-matchData.ts
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function main() {
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
                balls: 0
            },
            recentEvents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await matches.insertOne(match);
        console.log("Seeded dummy match.");

    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error("Seed match data failed:", err);
    process.exit(1);
});
