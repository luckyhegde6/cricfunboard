// models/Match.ts
import mongoose, { Schema, model, models } from "mongoose";

const MatchSchema = new Schema({
  name: { type: String },
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  venue: { type: String },
  startTime: { type: Date },
  status: {
    type: String,
    enum: ["scheduled", "live", "completed", "abandoned"],
    default: "scheduled",
    index: true,
  },
  maxOvers: { type: Number, default: 50 },
  scorerId: { type: Schema.Types.ObjectId, ref: "User" },
  captainId: { type: Schema.Types.ObjectId, ref: "User" },
  viceCaptainId: { type: Schema.Types.ObjectId, ref: "User" },

  // Toss information
  toss: {
    winner: { type: String }, // "Team A" or "Team B"
    decision: { type: String, enum: ["bat", "bowl"] }, // "bat" or "bowl"
    completedAt: { type: Date },
  },

  // Batting/Bowling teams
  battingTeam: { type: String }, // Current batting team
  bowlingTeam: { type: String }, // Current bowling team

  // Innings tracking
  currentInnings: { type: Number, default: 1 }, // 1 or 2
  innings1Summary: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    dismissedBatters: [{ type: String }], // Array of player IDs/Names
  },
  innings2Summary: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    dismissedBatters: [{ type: String }], // Array of player IDs/Names
  },

  // Match state workflow
  matchState: {
    type: String,
    enum: [
      "pre-toss",
      "toss-done",
      "live",
      "innings-break",
      "rain-delay",
      "completed",
    ],
    default: "pre-toss",
  },

  // Team lock (prevents team changes during live match)
  teamsLocked: { type: Boolean, default: false },

  // Match result
  result: { type: String },

  // Legacy summary (kept for backwards compatibility, use innings summaries instead)
  summary: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
  },

  // Current players on field
  currentBatters: {
    striker: { type: String },
    nonStriker: { type: String },
  },
  currentBowler: { type: String },

  // Keep a short list of recent events for quick display (not canonical)
  recentEvents: {
    type: [
      {
        type: { type: String }, // "dot", "runs", "wicket", etc.
        runs: { type: Number },
        batsman: { type: String },
        bowler: { type: String },
        createdAt: { type: Date },
        by: { type: String },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

// Index for queries by status + startTime
MatchSchema.index({ status: 1, startTime: 1 });
MatchSchema.index({ scorerId: 1 }); // For finding matches assigned to a scorer

export default models.Match || model("Match", MatchSchema);
