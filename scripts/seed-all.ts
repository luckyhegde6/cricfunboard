import dotenv from "dotenv";
import { seedAdmin } from "./seed-admin";
import { seedMatchData } from "./seed-matchData";
import { seedScorer } from "./seed-scorer";
import { seedTeams } from "./seed-teams";
import { seedUsers } from "./seed-users";
import seedVenues from "./seed-venues";
import seedTournaments from "./seed-tournaments";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function main() {
    console.log("Starting full database seed...");

    if (process.env.NODE_ENV !== "development" && process.env.FORCE_SEED !== "true") {
        console.log("Seed script only runs in development or with FORCE_SEED=true");
        process.exit(0);
    }

    try {
        console.log("\n--- Seeding Users ---");
        await seedUsers();
        console.log("✓ Users seeded");

        console.log("\n--- Seeding Admin ---");
        await seedAdmin();
        console.log("✓ Admin seeded");

        console.log("\n--- Seeding Scorer ---");
        await seedScorer();
        console.log("✓ Scorer seeded");

        console.log("\n--- Seeding Teams ---");
        await seedTeams();
        console.log("✓ Teams seeded");

        console.log("\n--- Seeding Venues ---");
        await seedVenues();
        console.log("✓ Venues seeded");

        console.log("\n--- Seeding Tournaments & Matches ---");
        await seedTournaments();
        console.log("✓ Tournaments & Matches seeded");

        console.log("\n--- Seeding Match Data ---");
        await seedMatchData();
        console.log("✓ Match Data seeded");

        console.log("\nAll seeds completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

main();
