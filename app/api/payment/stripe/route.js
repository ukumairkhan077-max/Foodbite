// app/api/payment/stripe/route.js
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { orderId } = await req.json();
    if (!orderId) return errorResponse("orderId is required.");

    await dbConnect();
    const order = await Order.findOne({ _id: orderId, user: authUser.userId });
    if (!order) return errorResponse("Order not found.", 404);
    if (order.isPaid) return errorResponse("This order is already paid.", 409);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe wants the smallest currency unit (paisa, not rupees)
      currency: "pkr",
      metadata: { orderId: order._id.toString() }, // used by the webhook to find the order back
    });

    return successResponse({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("stripe payment error:", err);
    return errorResponse("Something went wrong initiating payment.", 500);
  }
}
