// scripts/seed-tournaments.ts
import dbConnect from "../lib/db";
import TournamentModel from "../models/Tournament";
import TeamModel from "../models/Team";
import MatchModel from "../models/Match";

async function seedTournaments() {
    try {
        await dbConnect();

        // Check if tournaments already exist
        const count = await TournamentModel.countDocuments();
        if (count > 0) {
            console.log(`✓ Tournaments collection already has ${count} documents. Skipping seed.`);
            return;
        }

        // Get all teams for enrollment - bypass Mongoose type conflict
        // @ts-ignore - Mongoose find() has conflicting overload signatures
        const teams = (await TeamModel.find({}).limit(20).lean()) as any;
        if (teams.length < 4) {
            console.log("⚠ Not enough teams to create tournaments. Please seed teams first.");
            return;
        }

        const teamIds = teams.map((t: any) => t._id);

        // Create tournaments
        const tournaments = [
            {
                name: "Bangalore Premier League 2024",
                description: "Annual premier cricket tournament featuring top teams from Bangalore",
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                status: "upcoming",
                format: "T20",
                maxTeams: 16,
                enrollmentDeadline: new Date("2024-11-25"),
                teams: teamIds.slice(0, 8),
                admins: [],
                enrollmentRequests: [],
            },
            {
                name: "Karnataka State Championship",
                description: "State-level cricket championship",
                startDate: new Date("2025-01-15"),
                endDate: new Date("2025-02-28"),
                status: "upcoming",
                format: "ODI",
                maxTeams: 12,
                enrollmentDeadline: new Date("2025-01-10"),
                teams: teamIds.slice(0, 6),
                admins: [],
                enrollmentRequests: [],
            },
            {
                name: "Cubbon Park Cricket Festival",
                description: "Community cricket festival at Cubbon Park",
                startDate: new Date("2024-11-20"),
                endDate: new Date("2024-11-30"),
                status: "ongoing",
                format: "T20",
                maxTeams: 8,
                enrollmentDeadline: new Date("2024-11-15"),
                teams: teamIds.slice(0, 4),
                admins: [],
                enrollmentRequests: [],
            },
        ];

        // Cast to any to bypass TypeScript timestamp checking
        const createdTournaments = await TournamentModel.insertMany(tournaments as any);
        console.log(`✓ Successfully seeded ${createdTournaments.length} tournaments`);

        // Create matches for tournaments
        const matches: any[] = [];

        // Bangalore Premier League matches
        const bplTournament = createdTournaments[0];
        const bplTeams = teams.slice(0, 8);

        // Create round-robin matches for first 4 teams
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                matches.push({
                    tournamentId: bplTournament._id,
                    teamA: bplTeams[i].name,
                    teamB: bplTeams[j].name,
                    venue: "M. Chinnaswamy Stadium",
                    startTime: new Date(`2024-12-${5 + matches.length}`),
                    status: "scheduled",
                    format: "T20",
                    overs: 20,
                });
            }
        }

        // Karnataka State Championship matches
        const kscTournament = createdTournaments[1];
        const kscTeams = teams.slice(0, 6);

        for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 4; j++) {
                matches.push({
                    tournamentId: kscTournament._id,
                    teamA: kscTeams[i].name,
                    teamB: kscTeams[j].name,
                    venue: "KSCA Cricket Ground (Alur)",
                    startTime: new Date(`2025-01-${16 + matches.length - 6}`),
                    status: "scheduled",
                    format: "ODI",
                    overs: 50,
                });
            }
        }

        // Cubbon Park Festival matches
        const cpfTournament = createdTournaments[2];
        const cpfTeams = teams.slice(0, 4);

        // Semi-finals
        matches.push({
            tournamentId: cpfTournament._id,
            teamA: cpfTeams[0].name,
            teamB: cpfTeams[1].name,
            venue: "Kunti Cricket Ground",
            startTime: new Date("2024-11-28T14:00:00"),
            status: "scheduled",
            format: "T20",
            overs: 20,
        });

        matches.push({
            tournamentId: cpfTournament._id,
            teamA: cpfTeams[2].name,
            teamB: cpfTeams[3].name,
            venue: "Kunti Cricket Ground",
            startTime: new Date("2024-11-28T18:00:00"),
            status: "scheduled",
            format: "T20",
            overs: 20,
        });

        // Final
        matches.push({
            tournamentId: cpfTournament._id,
            teamA: "TBD",
            teamB: "TBD",
            venue: "M. Chinnaswamy Stadium",
            startTime: new Date("2024-11-30T18:00:00"),
            status: "scheduled",
            format: "T20",
            overs: 20,
        });

        // Add some friendly matches (no tournament)
        matches.push({
            teamA: teams[0].name,
            teamB: teams[1].name,
            venue: "Guru Nanak Cricket Ground",
            startTime: new Date("2024-12-15T15:00:00"),
            status: "scheduled",
            format: "T20",
            overs: 20,
        });

        matches.push({
            teamA: teams[2].name,
            teamB: teams[3].name,
            venue: "Just Cricket Academy & Ground",
            startTime: new Date("2024-12-20T10:00:00"),
            status: "scheduled",
            format: "ODI",
            overs: 50,
        });

        // Cast to any to bypass TypeScript checking
        const createdMatches = await MatchModel.insertMany(matches as any);
        console.log(`✓ Successfully seeded ${createdMatches.length} matches (${matches.filter(m => m.tournamentId).length} tournament matches, ${matches.filter(m => !m.tournamentId).length} friendly matches)`);

    } catch (error) {
        console.error("Error seeding tournaments:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedTournaments()
        .then(() => {
            console.log("Tournament seeding completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Tournament seeding failed:", error);
            process.exit(1);
        });
}

export default seedTournaments;
