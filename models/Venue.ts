// models/Venue.ts
import { model, models, Schema } from "mongoose";

const VenueSchema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String },
        city: { type: String },
        country: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        capacity: { type: Number },
        facilities: [{ type: String }], // e.g., ["Floodlights", "Pavilion", "Scoreboard"]
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

export default models.Venue || model("Venue", VenueSchema);
