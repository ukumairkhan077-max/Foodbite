# Foodbite

Full-stack Next.js (JavaScript) food delivery app — customer site and admin
panel in one project, backed by MongoDB and Firebase Phone Authentication.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI`, `JWT_SECRET`
   - Firebase client config (Console > Project Settings > General > Your apps)
   - Firebase admin credentials (Console > Project Settings > Service Accounts > Generate new private key)
   - In Firebase Console, enable **Authentication > Sign-in method > Phone**
   - Cloudinary, Stripe, JazzCash/Easypaisa (optional — only needed once you wire up images/payments)
3. `npm run seed:admin` — creates the first admin account
4. `npm run seed:data` — populates 3 branches, 5 categories, 14 menu items (with images), and 2 coupons
5. `npm run dev`

## Site flow
- **Home page (`/`) and menu browsing are public** — no login required to look around.
- **Checkout is protected** — a customer must sign up/log in only when they actually try to place an order.
- **Admin panel (`/admin/*`)** is fully separate and role-gated.

## Auth flow (Firebase Phone Auth)
1. Customer enters phone number at `/auth/register` → Firebase sends the OTP directly via SMS
2. Customer enters the code at `/auth/verify-otp` → Firebase confirms it client-side, then our backend verifies the resulting token and creates/finds the User
3. `/auth/complete-profile` → customer sets name, email, password → fully signed up
4. `/auth/login` (customers) and `/admin/login` (admins) both use email+password against the same backend endpoint afterward

## Structure
- `app/(customer)/` — public + customer pages
- `app/(admin)/admin/` — admin panel
- `app/api/` — backend routes (Next.js API routes, same app)
- `models/` — Mongoose schemas
- `context/` — AuthContext, CartContext
- `lib/` — apiClient, dbConnect, auth, firebase (client), firebaseAdmin (server)
