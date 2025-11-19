// scripts/seed-teams.ts
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
                { name: "Player 1", role: "batsman", isExtra: false },
                { name: "Player 2", role: "bowler", isExtra: false },
                { name: "Player 3", role: "allrounder", isExtra: false },
                { name: "Player 4", role: "keeper", isExtra: false },
                { name: "Extra Player", role: "batsman", isExtra: true },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const teamB = {
            name: "Team B",
            contactEmail: "teamb@test.com",
            players: [
                { name: "Opponent 1", role: "batsman", isExtra: false },
                { name: "Opponent 2", role: "bowler", isExtra: false },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Upsert Team A
        await teams.updateOne(
            { name: "Team A" },
            { $set: teamA },
            { upsert: true }
        );
        console.log("Seeded Team A");

        // Upsert Team B
        await teams.updateOne(
            { name: "Team B" },
            { $set: teamB },
            { upsert: true }
        );
        console.log("Seeded Team B");

    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error("Seed teams failed:", err);
    process.exit(1);
});
