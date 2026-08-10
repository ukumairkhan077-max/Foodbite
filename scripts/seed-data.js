// scripts/seed-data.js
// Seeds realistic dummy data into MongoDB — 3 branches, 8 categories, 50 menu items
// (from data/dummyMenuData.js), and 2 coupons — so the site looks and works like a
// real storefront out of the box. Run with: npm run seed:data
//
// Images use Lorem Picsum (https://picsum.photos) — real stock photography served
// from stable, always-working URLs. Swap these for your own product photography
// (via POST /api/upload, which uploads to Cloudinary) before going live.

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../lib/dbConnect.js";
import Category from "../models/Category.js";
import Branch from "../models/Branch.js";
import MenuItem from "../models/MenuItem.js";
import Coupon from "../models/Coupon.js";
import { dummyCategories, dummyMenuItems } from "../data/dummyMenuData.js";

const img = (seed) => `https://picsum.photos/seed/${seed}/600/450`;

async function upsertCategory(cat) {
  return Category.findOneAndUpdate(
    { slug: cat.slug },
    { name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder, imageUrl: img(cat.slug) },
    { upsert: true, new: true }
  );
}

async function upsertBranch(data) {
  return Branch.findOneAndUpdate({ name: data.name }, data, { upsert: true, new: true });
}

async function upsertMenuItem(data) {
  return MenuItem.findOneAndUpdate({ name: data.name }, data, { upsert: true, new: true });
}

async function seedData() {
  await dbConnect();

  // ── Branches ──────────────────────────────────────────
  const gulberg = await upsertBranch({
    name: "Foodbite - Gulberg",
    city: "Lahore",
    address: "Main Boulevard, Gulberg III, Lahore",
    latitude: 31.5203,
    longitude: 74.3587,
    contactPhone: "042111222333",
    deliveryFee: 100,
    minOrderAmount: 300,
  });

  await upsertBranch({
    name: "Foodbite - DHA Phase 5",
    city: "Karachi",
    address: "Khayaban-e-Ittehad, DHA Phase 5, Karachi",
    latitude: 24.8138,
    longitude: 67.0653,
    contactPhone: "021111222333",
    deliveryFee: 120,
    minOrderAmount: 300,
  });

  await upsertBranch({
    name: "Foodbite - F-10 Markaz",
    city: "Islamabad",
    address: "F-10 Markaz, Islamabad",
    latitude: 33.6938,
    longitude: 73.0116,
    contactPhone: "051111222333",
    deliveryFee: 100,
    minOrderAmount: 250,
  });

  // ── Categories (8, from data/dummyMenuData.js) ──────────
  const categoryDocs = {};
  for (const cat of dummyCategories) {
    categoryDocs[cat.slug] = await upsertCategory(cat);
  }

  // ── Menu items (50, from data/dummyMenuData.js) ──────────
  for (const item of dummyMenuItems) {
    const categoryDoc = categoryDocs[item.category];
    if (!categoryDoc) {
      console.warn(`Skipping "${item.name}" — unknown category slug "${item.category}"`);
      continue;
    }

    await upsertMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      category: categoryDoc._id,
      branch: gulberg._id,
      isAvailable: item.isAvailable,
      isDeal: item.isDeal,
      isFeatured: item.isFeatured,
      variants: item.variants,
      addOns: item.addOns,
      avgRating: item.avgRating,
      reviewCount: item.reviewCount,
    });
  }

  // ── Coupons ──────────────────────────────────────────
  await Coupon.findOneAndUpdate(
    { code: "WELCOME20" },
    {
      code: "WELCOME20",
      description: "20% off for new customers, up to Rs 300",
      discountType: "PERCENTAGE",
      value: 20,
      maxDiscountAmount: 300,
      minOrderAmt: 500,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days out
    },
    { upsert: true }
  );

  await Coupon.findOneAndUpdate(
    { code: "FLAT150" },
    {
      code: "FLAT150",
      description: "Rs 150 off on orders above Rs 1000",
      discountType: "FLAT",
      value: 150,
      minOrderAmt: 1000,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    { upsert: true }
  );

  console.log(
    `Seed complete: 3 branches, ${dummyCategories.length} categories, ${dummyMenuItems.length} menu items, 2 coupons.`
  );
  process.exit(0);
}

seedData().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
