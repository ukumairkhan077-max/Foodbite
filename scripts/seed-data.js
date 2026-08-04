// scripts/seed-data.js
// Optional: seeds one sample category, branch, and menu item for local testing.
// Run with: npm run seed:data

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../lib/dbConnect.js";
import Category from "../models/Category.js";
import Branch from "../models/Branch.js";
import MenuItem from "../models/MenuItem.js";

async function seedData() {
  await dbConnect();

  const category = await Category.findOneAndUpdate(
    { slug: "burgers" },
    { name: "Burgers", slug: "burgers", displayOrder: 1 },
    { upsert: true, new: true }
  );

  const branch = await Branch.findOneAndUpdate(
    { name: "Foodbite - Gulberg" },
    {
      name: "Foodbite - Gulberg",
      city: "Lahore",
      address: "Main Boulevard, Gulberg III, Lahore",
      latitude: 31.5203,
      longitude: 74.3587,
      contactPhone: "042111222333",
      deliveryFee: 100,
      minOrderAmount: 300,
    },
    { upsert: true, new: true }
  );

  await MenuItem.findOneAndUpdate(
    { name: "Zinger Burger" },
    {
      name: "Zinger Burger",
      description: "Crispy fried chicken fillet with mayo and lettuce",
      price: 550,
      category: category._id,
      variants: [
        { name: "Regular", priceDiff: 0 },
        { name: "Large", priceDiff: 150 },
      ],
      addOns: [
        { name: "Extra Cheese", price: 80 },
        { name: "Extra Patty", price: 200 },
      ],
    },
    { upsert: true, new: true }
  );

  console.log("Sample data seeded: 1 category, 1 branch, 1 menu item.");
  process.exit(0);
}

seedData();