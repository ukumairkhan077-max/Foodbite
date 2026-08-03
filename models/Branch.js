// models/Branch.js
import { Schema, models, model } from "mongoose";

const BranchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },

    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    contactPhone: { type: String, required: true },

    isActive: { type: Boolean, default: true },
    openTime: { type: String, default: "11:00" },
    closeTime: { type: String, default: "23:00" },

    deliveryRadiusKm: { type: Number, default: 5 },
    minOrderAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BranchSchema.index({ latitude: 1, longitude: 1 });

export default models.Branch || model("Branch", BranchSchema);
