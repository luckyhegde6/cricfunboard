// scripts/start-local.ts
/**
 * Script to start local development environment with Docker MongoDB and local Next.js/Socket servers
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function waitForMongo(maxRetries = 30, delayMs = 1000): Promise<void> {
    console.log("Waiting for MongoDB to be ready...");

    for (let i = 0; i < maxRetries; i++) {
        try {
            const { stdout } = await execAsync(
                'docker exec cricfunboard-mongo mongosh --eval "db.adminCommand(\'ping\')" --quiet'
            );
            if (stdout.includes("ok")) {
                console.log("MongoDB is ready!");
                return;
            }
        } catch (error) {
            // MongoDB not ready yet
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
        process.stdout.write(".");
    }

    throw new Error("MongoDB failed to start in time");
}

async function checkIfDatabaseSeeded(): Promise<boolean> {
    try {
        console.log("  Checking users collection count...");
        // Check if users collection exists and has documents
        const { stdout, stderr } = await execAsync(
            'docker exec cricfunboard-mongo mongosh cricfunboard --eval "db.users.countDocuments()" --quiet'
        );

        if (stderr) {
            console.log("  Warning: stderr during check:", stderr);
        }

        const count = parseInt(stdout.trim());
        console.log(`  Found ${count} users in database.`);
        return count > 0;
    } catch (error) {
        console.log("  Error checking database state:", error);
        // If there's an error, assume database is not seeded
        return false;
    }
}

async function main() {
    try {
        console.log("Starting MongoDB in Docker...");
        await execAsync("docker-compose up -d");
        console.log("MongoDB container started.");

        // Wait for MongoDB to be ready
        await waitForMongo();

        // Check if database is already seeded
        console.log("\nChecking if database is seeded...");
        const isSeeded = await checkIfDatabaseSeeded();

        if (isSeeded) {
            console.log("✓ Database is already seeded. Skipping seed scripts.");
            console.log("  (To force re-seeding, run: FORCE_SEED=true npm run seed:all)");
        } else {
            console.log("Database is empty. Running seed scripts...");
            // Use spawn to inherit stdio so we see logs in real-time
            await new Promise<void>((resolve, reject) => {
                const { spawn } = require("child_process");
                // Explicitly set NODE_ENV and FORCE_SEED to ensure it runs
                const env = { ...process.env, NODE_ENV: "development", FORCE_SEED: "true" };

                const seedProcess = spawn("npm", ["run", "seed:all"], {
                    stdio: "inherit",
                    shell: true,
                    env: env
                });

                seedProcess.on("close", (code: number) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Seed process exited with code ${code}`));
                });
            });
        }

        console.log("\n✅ Local environment is ready!");
        console.log("\n📦 Services:");
        console.log("  MongoDB: mongodb://localhost:27017/cricfunboard (Docker)");

        // Start Socket server in a new terminal (non-blocking)
        console.log("\n🔌 Starting Socket server in new terminal...");
        exec('start "Socket Server" cmd /k "npm run socket"');
        console.log("  ✓ Socket server starting on http://localhost:4000");

        console.log("\n✨ Setup complete!");
        console.log("\n🌐 Services:");
        console.log("  • MongoDB: mongodb://localhost:27017/cricfunboard (Docker)");
        console.log("  • Socket Server: http://localhost:4000 (New terminal window)");
        console.log("\n" + "=".repeat(60));
        console.log("Starting Next.js Dev Server on http://localhost:3000");
        console.log("=".repeat(60) + "\n");

        // Start Next.js in the current terminal using exec (which will keep running)
        const child = exec("npm run dev", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(stdout);
        });

        // Pipe output to current terminal
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);

        // Handle Ctrl+C
        process.on("SIGINT", () => {
            console.log("\n\nShutting down Next.js...");
            child.kill();
            process.exit(0);
        });

        // Keep the script running
        await new Promise(() => { });

    } catch (error) {
        console.error("Failed to start local environment:", error);
        process.exit(1);
    }
}

main();
