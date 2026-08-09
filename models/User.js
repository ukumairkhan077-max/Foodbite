// models/User.js
import mongoose from "mongoose";
const { Schema, models, model } = mongoose;

// Embedded subdocument — no need for a separate Address collection
const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },

    // select: false -> never returned by default queries, must explicitly .select("+password")
    password: { type: String, select: false },

    role: {
      type: String,
      enum: ["CUSTOMER", "ADMIN", "BRANCH_MANAGER", "RIDER"],
      default: "CUSTOMER",
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    addresses: [AddressSchema],
    favorites: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }],
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },

    riderDetails: {
      isAvailable: { type: Boolean, default: true },
      vehicleNo: String,
      currentLat: Number,
      currentLng: Number,
    },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
