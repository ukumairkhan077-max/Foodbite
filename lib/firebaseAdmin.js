// lib/firebaseAdmin.js
// Server-side Firebase setup. Used only to verify the ID token the frontend gets
// after Firebase confirms the customer's phone OTP — we never send or check OTPs
// ourselves anymore, Firebase's own servers do that.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
  if (getApps().length) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Env vars store newlines as literal "\n" — this converts them back to real line breaks
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Returns the decoded token (includes phone_number in E.164 format, e.g. "+923001234567")
// or throws if the token is invalid/expired.
export async function verifyFirebaseToken(idToken) {
  const app = getFirebaseAdminApp();
  return getAuth(app).verifyIdToken(idToken);
}
