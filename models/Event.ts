import mongoose, { Schema } from "mongoose";

const EventSchema = new Schema(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    over: Number,
    ball: Number,
    batsmanId: String,
    bowlerId: String,
    runs: Number,
    extras: Number,
    wicket: Boolean,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

EventSchema.index({ matchId: 1, createdAt: 1 });
export default mongoose.models.Event || mongoose.model("Event", EventSchema);
