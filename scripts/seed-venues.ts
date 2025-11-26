// scripts/seed-venues.ts
import dbConnect from "../lib/db";
import VenueModel from "../models/Venue";

// Embed venues data directly to avoid ts-node import issues
const venues = [
    {
        name: "M. Chinnaswamy Stadium",
        address: "Mahatma Gandhi Road, Cubbon Park, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.978814,
        longitude: 77.599593,
        capacity: 40000,
        facilities: ["Floodlights", "Pavilion", "Press Box", "VIP Boxes", "Scoreboard", "Practice Nets"]
    },
    {
        name: "KSCA Cricket Ground (Alur)",
        address: "Alur, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.1167,
        longitude: 77.4667,
        capacity: 5000,
        facilities: ["Three Ovals", "Platinum Jubilee Pavilion", "22 Practice Pitches", "Indoor Practice Facility"]
    },
    {
        name: "Guru Nanak Cricket Ground",
        address: "Guru Nanak Bhawan, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.9698,
        longitude: 77.5986,
        capacity: 2000,
        facilities: ["Athletic Track", "Practice Nets", "Pavilion"]
    },
    {
        name: "Air Force Cricket Ground",
        address: "Yelahanka, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.1000,
        longitude: 77.5964,
        capacity: 2500,
        facilities: ["Training Academy", "Pavilion", "Practice Nets"]
    },
    {
        name: "Just Cricket Academy & Ground",
        address: "Rajanukunte, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.1500,
        longitude: 77.5500,
        capacity: 3000,
        facilities: ["9 Pitches", "Indoor Astro Nets", "Outdoor Turf Wickets", "Matting Wickets"]
    },
    {
        name: "Gopalan Cricket Academy",
        address: "Veerenahalli, Avalahalli, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.0300,
        longitude: 77.5100,
        capacity: 800,
        facilities: ["Ground A", "Ground B", "Ground C", "Coaching", "Practice Nets"]
    },
    {
        name: "RKO3 Cricket Ground",
        address: "Arakere, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.8900,
        longitude: 77.6100,
        capacity: 500,
        facilities: ["Turf Wicket", "Practice Nets"]
    },
    {
        name: "Kites Sports",
        address: "NPS Banashankari, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.9200,
        longitude: 77.5600,
        capacity: 400,
        facilities: ["Turf Ground", "Changing Rooms"]
    },
    {
        name: "Sprintz Arena",
        address: "Sattva Global City, Rajarajeshwari Nagar, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.9100,
        longitude: 77.5100,
        capacity: 600,
        facilities: ["Turf Ground", "Floodlights", "Changing Rooms"]
    },
    {
        name: "CMR University Cricket Ground",
        address: "Hennur Gardens, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.0400,
        longitude: 77.6500,
        capacity: 1000,
        facilities: ["University Ground", "Pavilion", "Practice Nets"]
    },
    {
        name: "Padukone Dravid Centre for Sports Excellence",
        address: "Bettahalasuru, Chikkajala, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.1500,
        longitude: 77.6500,
        capacity: 1500,
        facilities: ["Elite Training Center", "Multiple Grounds", "Coaching", "Hostel"]
    },
    {
        name: "Indian Institute of Science Ground",
        address: "IISc Campus, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.0220,
        longitude: 77.5650,
        capacity: 1000,
        facilities: ["Campus Ground", "Practice Nets"]
    },
    {
        name: "Hindustan Aeronautics Limited Ground",
        address: "HAL, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.9600,
        longitude: 77.6650,
        capacity: 1500,
        facilities: ["Corporate Ground", "Pavilion"]
    },
    {
        name: "BEL Sports Ground",
        address: "BEL Layout, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 13.0100,
        longitude: 77.5200,
        capacity: 1000,
        facilities: ["Corporate Ground", "Pavilion"]
    },
    {
        name: "MICO Ground",
        address: "MICO Layout, Bengaluru",
        city: "Bengaluru",
        country: "India",
        latitude: 12.9300,
        longitude: 77.5900,
        capacity: 1000,
        facilities: ["Corporate Ground", "Pavilion"]
    }
];

async function seedVenues() {
    try {
        await dbConnect();

        // Check if venues already exist
        const count = await VenueModel.countDocuments();
        if (count > 0) {
            console.log(`✓ Venues collection already has ${count} documents. Skipping seed.`);
            return;
        }

        console.log("Seeding venues...");
        // Cast to any to bypass TypeScript timestamp checking - Mongoose will add timestamps automatically
        await VenueModel.insertMany(venues as any);
        console.log(`✓ Successfully seeded ${venues.length} venues`);
    } catch (error) {
        console.error("Error seeding venues:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedVenues()
        .then(() => {
            console.log("Venue seeding completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Venue seeding failed:", error);
            process.exit(1);
        });
}

export default seedVenues;
