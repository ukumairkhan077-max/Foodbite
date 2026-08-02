import { Schema, models, model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, enum: ["PERCENTAGE", "FLAT"], required: true },
    value: { type: Number, required: true },
    maxDiscountAmount: Number,
    minOrderAmt: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null },
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    applicableBranches: [{ type: Schema.Types.ObjectId, ref: "Branch" }],
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Coupon || model("Coupon", CouponSchema);