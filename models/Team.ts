// models/Team.ts
import mongoose, { Schema, model, models } from "mongoose";

const PlayerSchema = new Schema({
    name: { type: String, required: true },
    role: {
        type: String,
        enum: ["batsman", "bowler", "allrounder", "keeper"],
        required: true
    },
    isExtra: { type: Boolean, default: false },
    email: { type: String }, // Optional
    contact: { type: String }, // Optional
});

const TeamSchema = new Schema({
    name: { type: String, required: true, unique: true },
    players: [PlayerSchema],
    captainId: { type: Schema.Types.ObjectId, ref: "User" },
    viceCaptainId: { type: Schema.Types.ObjectId, ref: "User" },
    contactEmail: { type: String },
    contactPhone: { type: String },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

export default models.Team || model("Team", TeamSchema);
