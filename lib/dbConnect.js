// lib/dbConnect.js
import mongoose from "mongoose";

// Cache the connection across hot reloads in dev (Next.js specific pattern)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  // Read env var here, not at module load time — this matters for scripts run
  // via plain `node` (like seed-admin.js), where dotenv.config() must finish
  // BEFORE this check runs. Since ES module imports are hoisted above all other
  // code, checking process.env at the top of this file would run too early.
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
