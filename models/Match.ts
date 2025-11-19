// models/Match.ts
import mongoose, { Schema, model, models } from "mongoose";

const MatchSchema = new Schema({
  name: { type: String },
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  venue: { type: String },
  startTime: { type: Date },
  status: { type: String, enum: ["scheduled", "live", "completed", "abandoned"], default: "scheduled", index: true },
  maxOvers: { type: Number, default: 50 },
  summary: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }, // total balls used in innings
  },
  // keep a short list of recent events for quick display (not canonical)
  recentEvents: {
    type: [
      {
        type: String,
        runs: Number,
        batsman: String,
        bowler: String,
        createdAt: Date,
        by: String,
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

// Index for queries by status + startTime
MatchSchema.index({ status: 1, startTime: 1 });

export default models.Match || model("Match", MatchSchema);
