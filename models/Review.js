// models/Review.js
import { Schema, models, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },

    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ user: 1, menuItem: 1, order: 1 }, { unique: true, sparse: true });

export default models.Review || model("Review", ReviewSchema);
