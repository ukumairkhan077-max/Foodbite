// app/api/orders/route.js
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import Coupon from "@/models/Coupon";
import Branch from "@/models/Branch";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET /api/orders — customers see their own orders; admin/branch manager see all orders for their branch
export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();

    let filter = {};
    if (authUser.role === "CUSTOMER") {
      filter.user = authUser.userId;
    } else if (authUser.role === "ADMIN") {
      const { searchParams } = new URL(req.url);
      const branch = searchParams.get("branch");
      const status = searchParams.get("status");
      if (branch) filter.branch = branch;
      if (status) filter.status = status;
    } else {
      return errorResponse("Not authorized to view orders.", 403);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate("branch", "name city");
    return successResponse({ orders });
  } catch (err) {
    console.error("get orders error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/orders — customer places a new order
export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);
    if (authUser.role !== "CUSTOMER") return errorResponse("Only customers can place orders.", 403);

    const body = await req.json();
    const { branch: branchId, orderType, deliveryAddress, items, paymentMethod, couponCode } = body;

    if (!branchId) return errorResponse("Branch is required.");
    if (!items || !items.length) return errorResponse("Order must contain at least one item.");
    if (!paymentMethod) return errorResponse("Payment method is required.");
    if (orderType === "DELIVERY" && !deliveryAddress) return errorResponse("Delivery address is required.");

    await dbConnect();

    const branch = await Branch.findById(branchId);
    if (!branch || !branch.isActive) return errorResponse("Selected branch is not available.", 404);

    // Rebuild each item server-side from the DB — never trust prices sent from the client
    let subtotal = 0;
    const orderItems = [];

    for (const reqItem of items) {
      const menuItem = await MenuItem.findById(reqItem.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return errorResponse(`Menu item ${reqItem.menuItemId} is not available.`, 400);
      }

      let unitPrice = menuItem.price;

      if (reqItem.variant) {
        const variant = menuItem.variants.find((v) => v.name === reqItem.variant);
        if (variant) unitPrice += variant.priceDiff;
      }

      let addOnsTotal = 0;
      const chosenAddOns = [];
      if (reqItem.addOns?.length) {
        for (const addOnName of reqItem.addOns) {
          const addOn = menuItem.addOns.find((a) => a.name === addOnName);
          if (addOn) {
            addOnsTotal += addOn.price;
            chosenAddOns.push({ name: addOn.name, price: addOn.price });
          }
        }
      }

      const quantity = reqItem.quantity || 1;
      const lineTotal = (unitPrice + addOnsTotal) * quantity;
      subtotal += lineTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        variant: reqItem.variant,
        addOns: chosenAddOns,
        quantity,
        price: unitPrice + addOnsTotal,
        notes: reqItem.notes,
      });
    }

    if (subtotal < branch.minOrderAmount) {
      return errorResponse(`Minimum order amount for this branch is Rs ${branch.minOrderAmount}.`, 400);
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) return errorResponse("Invalid or expired coupon code.", 400);
      if (new Date() > coupon.expiresAt) return errorResponse("This coupon has expired.", 400);
      if (subtotal < coupon.minOrderAmt) {
        return errorResponse(`This coupon requires a minimum order of Rs ${coupon.minOrderAmt}.`, 400);
      }
      if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
        return errorResponse("This coupon has reached its usage limit.", 400);
      }

      discount =
        coupon.discountType === "PERCENTAGE"
          ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscountAmount || Infinity)
          : coupon.value;

      coupon.usedCount += 1;
      await coupon.save();
    }

    const deliveryFee = orderType === "PICKUP" ? 0 : branch.deliveryFee;
    const total = subtotal + deliveryFee - discount;

    const order = await Order.create({
      user: authUser.userId,
      branch: branch._id,
      orderType: orderType || "DELIVERY",
      deliveryAddress: orderType === "PICKUP" ? undefined : deliveryAddress,
      items: orderItems,
      paymentMethod,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode: couponCode?.toUpperCase(),
      statusHistory: [{ status: "PENDING" }],
    });

    return successResponse({ message: "Order placed successfully", order }, 201);
  } catch (err) {
    console.error("create order error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
