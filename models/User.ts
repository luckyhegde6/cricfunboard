// models/User.ts
import { model, models, Schema } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  role: {
    type: String,
    enum: ["user", "scorer", "admin", "captain", "vicecaptain"],
    default: "user",
    index: true,
  },
  name: { type: String },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

export default models.User || model("User", UserSchema);
