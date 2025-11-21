import mongoose, { Schema, model, models } from "mongoose";

const PlayerSchema = new Schema({
    name: { type: String, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    role: { type: String, enum: ["batsman", "bowler", "allrounder", "keeper"] },

    // Career Stats
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: { type: String }, // e.g. "5/20"

    // Current Match Stats (could be transient or stored in MatchPlayer model, but simple here)
    // Actually, better to store match-specific stats in the Match model or a MatchPlayer model.
    // This model is for the player entity itself.

    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

export default models.Player || model("Player", PlayerSchema);
