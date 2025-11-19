// models/Config.ts
import mongoose, { Schema, model, models } from "mongoose";

const ConfigSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
    updatedAt: { type: Date, default: () => new Date() },
});

export default models.Config || model("Config", ConfigSchema);
