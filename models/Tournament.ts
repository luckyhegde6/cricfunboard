import { Schema, model, models } from "mongoose";

const EnrolledTeamSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  enrolledAt: { type: Date, default: () => new Date() },
});

const TournamentSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
    index: true,
  },
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }], // Approved teams participating
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  
  // Enrollment details
  enrollmentStatus: {
    type: String,
    enum: ["open", "closed"],
    default: "closed",
  },
  enrolledTeams: [EnrolledTeamSchema], // Teams that applied

  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

export default models.Tournament || model("Tournament", TournamentSchema);
