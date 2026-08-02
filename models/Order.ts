import { Schema, models, model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    variant: String,
    addOns: [{ name: String, price: Number }],
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    notes: String,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    orderType: { type: String, enum: ["DELIVERY", "PICKUP"], default: "DELIVERY" },
    deliveryAddress: { fullAddress: String, city: String, latitude: Number, longitude: Number },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    statusHistory: [{ status: String, changedAt: { type: Date, default: Date.now } }],
    paymentMethod: { type: String, enum: ["COD", "JAZZCASH", "EASYPAISA", "CARD"], required: true },
    isPaid: { type: Boolean, default: false },
    paymentReference: String,
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    rider: { type: Schema.Types.ObjectId, ref: "User" },
    cancelReason: String,
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ branch: 1, status: 1 });

export default models.Order || model("Order", OrderSchema);