// models/MatchEvent.ts
import mongoose, { Schema, model, models } from "mongoose";

const MatchEventSchema = new Schema({
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    type: { type: String, enum: ["dot", "runs", "wicket", "nb", "wd", "bye", "lb", "undo", "announcement"], required: true },
    runs: { type: Number, default: 0 },
    batsman: { type: String },
    bowler: { type: String },
    over: { type: Number }, // optional -- client can provide or server can compute
    ball: { type: Number }, // ball number within over
    innings: { type: Number }, // which innings this event belongs to
    wicketType: { type: String }, // caught, bowled, lbw, run-out, stumped
    dismissedBatter: { type: String }, // player ID who got out
    createdAt: { type: Date, default: () => new Date(), index: true },
    meta: { type: Schema.Types.Mixed },
    by: { type: String }, // user who inserted
});

MatchEventSchema.index({ matchId: 1, createdAt: -1 });
MatchEventSchema.index({ matchId: 1, over: 1, ball: 1 });

export default models.MatchEvent || model("MatchEvent", MatchEventSchema);
