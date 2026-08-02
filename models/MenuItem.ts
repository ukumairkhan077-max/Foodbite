import { Schema, models, model } from "mongoose";

const VariantSchema = new Schema(
  { name: { type: String, required: true }, priceDiff: { type: Number, default: 0 } },
  { _id: false }
);

const AddOnSchema = new Schema(
  { name: { type: String, required: true }, price: { type: Number, required: true } },
  { _id: false }
);

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    imageUrl: String,
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
    isAvailable: { type: Boolean, default: true },
    isDeal: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    variants: [VariantSchema],
    addOns: [AddOnSchema],
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MenuItemSchema.index({ name: "text", description: "text" });

export default models.MenuItem || model("MenuItem", MenuItemSchema);