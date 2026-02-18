// =============================================================
// seed.ts — Inserts realistic test data into the booking app DB
// Run with:  npx tsx seed.ts
// Requires:  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
// Uses the service role key so RLS is bypassed during seeding.
// =============================================================
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// Service Role Key is required for seeding to bypass RLS and create auth users
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ─── Helpers ────────────────────────────────────────────────

function log(msg: string) {
  console.log(`\n▶ ${msg}`);
}
function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}
function fail(msg: string, err: unknown) {
  console.error(`  ✗ ${msg}`, err);
  process.exit(1);
}

async function createAuthUser(
  email: string,
  password: string,
  meta: Record<string, string>,
): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });
  if (error) fail(`createAuthUser(${email})`, error);
  return data.user!.id;
}

// ─── 1. Auth users (triggers handle_new_auth_user auto-creates rows in `users`) ──

log("Creating auth users…");

const hostAuthId = await createAuthUser("host@demo.com", "password123", {
  first_name: "Sarah",
  last_name: "Mitchell",
  user_type: "host",
});

const guest1AuthId = await createAuthUser("alice@demo.com", "password123", {
  first_name: "Alice",
  last_name: "Johnson",
  user_type: "guest",
});

const guest2AuthId = await createAuthUser("bob@demo.com", "password123", {
  first_name: "Bob",
  last_name: "Carter",
  user_type: "guest",
});

ok(`host   → ${hostAuthId}`);
ok(`alice  → ${guest1AuthId}`);
ok(`bob    → ${guest2AuthId}`);

// ─── 2. Fetch the auto-created user rows ─────────────────────

log("Fetching user_ids from users table…");

const { data: userRows, error: userErr } = await supabase
  .from("users")
  .select("user_id, auth_id, email")
  .in("auth_id", [hostAuthId, guest1AuthId, guest2AuthId]);

if (userErr) fail("fetch users", userErr);

const byAuth = Object.fromEntries(userRows!.map((u) => [u.auth_id, u.user_id]));
const hostId = byAuth[hostAuthId];
const alice_id = byAuth[guest1AuthId];
const bob_id = byAuth[guest2AuthId];

ok(`host user_id   = ${hostId}`);
ok(`alice user_id  = ${alice_id}`);
ok(`bob user_id    = ${bob_id}`);

// ─── 3. Hotels ───────────────────────────────────────────────

log("Inserting hotels…");

const { data: hotels, error: hotelErr } = await supabase
  .from("hotels")
  .insert([
    {
      host_id: hostId,
      name: "The Grand Olive",
      description:
        "A charming boutique hotel in the heart of the city with rooftop views.",
      address: "12 Marble Lane",
      city: "Rome",
      country: "Italy",
      price_per_night: 149.0,
      max_guests: 3,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ["wifi", "breakfast", "rooftop", "air_conditioning"],
      images: [
        "hotel-images/grand-olive-1.jpg",
        "hotel-images/grand-olive-2.jpg",
      ],
      primary_image_url: "hotel-images/grand-olive-1.jpg",
      is_active: true,
    },
    {
      host_id: hostId,
      name: "Sunset Beach Studio",
      description: "A cosy studio right on the seafront. Perfect for couples.",
      address: "7 Shoreline Drive",
      city: "Barcelona",
      country: "Spain",
      price_per_night: 89.0,
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["wifi", "pool", "parking", "gym"],
      images: ["hotel-images/sunset-1.jpg"],
      primary_image_url: "hotel-images/sunset-1.jpg",
      is_active: true,
    },
    {
      // Inactive listing — should not appear in public searches
      host_id: hostId,
      name: "Unlisted Mountain Cabin",
      description: "Not ready yet.",
      address: "1 Alpine Road",
      city: "Rome",
      country: "Italy",
      price_per_night: 60.0,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: [],
      images: [],
      is_active: false,
    },
  ])
  .select("hotel_id, name");

if (hotelErr) fail("insert hotels", hotelErr);
const [grandOlive, sunsetStudio, inactiveHotel] = hotels!;
ok(`"${grandOlive.name}"  → hotel_id ${grandOlive.hotel_id}`);
ok(`"${sunsetStudio.name}" → hotel_id ${sunsetStudio.hotel_id}`);
ok(`"${inactiveHotel.name}" → hotel_id ${inactiveHotel.hotel_id} (inactive)`);

// ─── 4. Famous places ────────────────────────────────────────

log("Inserting famous places…");

const { data: places, error: placeErr } = await supabase
  .from("famous_places")
  .insert([
    {
      name: "Colosseum",
      description: "Ancient amphitheatre and icon of Imperial Rome.",
      address: "Piazza del Colosseo, 1",
      city: "Rome",
      country: "Italy",
      category: "landmark",
      primary_image_url: "place-images/colosseum.jpg",
      images: ["place-images/colosseum.jpg", "place-images/colosseum-2.jpg"],
    },
    {
      name: "Trevi Fountain",
      description: "The largest Baroque fountain in Rome.",
      address: "Piazza di Trevi",
      city: "Rome",
      country: "Italy",
      category: "landmark",
      primary_image_url: "place-images/trevi.jpg",
      images: ["place-images/trevi.jpg"],
    },
    {
      name: "La Boqueria Market",
      description: "Famous public market with fresh produce and street food.",
      address: "La Rambla, 91",
      city: "Barcelona",
      country: "Spain",
      category: "market",
      primary_image_url: "place-images/boqueria.jpg",
      images: ["place-images/boqueria.jpg"],
    },
    {
      name: "Sagrada Família",
      description: "Gaudí's unfinished masterpiece basilica.",
      address: "Carrer de Mallorca, 401",
      city: "Barcelona",
      country: "Spain",
      category: "landmark",
      primary_image_url: "place-images/sagrada.jpg",
      images: ["place-images/sagrada.jpg"],
    },
  ])
  .select("place_id, name, city");

if (placeErr) fail("insert famous places", placeErr);
const [colosseum, trevi, boqueria, sagrada] = places!;
places!.forEach((p) => ok(`"${p.name}" (${p.city}) → place_id ${p.place_id}`));

// ─── 5. Hotel ↔ Famous places links ─────────────────────────

log("Linking hotels to nearby famous places…");

const { error: linkErr } = await supabase.from("hotel_famous_places").insert([
  {
    hotel_id: grandOlive.hotel_id,
    place_id: colosseum.place_id,
    distance_m: 800,
  },
  { hotel_id: grandOlive.hotel_id, place_id: trevi.place_id, distance_m: 1200 },
  {
    hotel_id: sunsetStudio.hotel_id,
    place_id: boqueria.place_id,
    distance_m: 500,
  },
  {
    hotel_id: sunsetStudio.hotel_id,
    place_id: sagrada.place_id,
    distance_m: 2100,
  },
]);

if (linkErr) fail("insert hotel_famous_places", linkErr);
ok("Grand Olive → Colosseum (800 m), Trevi (1200 m)");
ok("Sunset Studio → Boqueria (500 m), Sagrada (2100 m)");

// ─── 6. Bookings ─────────────────────────────────────────────

log("Inserting bookings…");

const today = new Date();
const future = (days: number) =>
  new Date(today.getTime() + days * 86_400_000).toISOString().slice(0, 10);

const { data: bookings, error: bookingErr } = await supabase
  .from("bookings")
  .insert([
    {
      // Confirmed booking with payment
      hotel_id: grandOlive.hotel_id,
      guest_id: alice_id,
      check_in_date: future(10),
      check_out_date: future(13), // 3 nights
      num_guests: 2,
      total_price: 149.0 * 3,
      status: "confirmed",
      notes: "We'd love early check-in if possible!",
    },
    {
      // Pending booking — used to test double booking prevention
      hotel_id: grandOlive.hotel_id,
      guest_id: bob_id,
      check_in_date: future(20),
      check_out_date: future(23),
      num_guests: 1,
      total_price: 149.0 * 3,
      status: "pending",
    },
    {
      // Completed booking — Alice can leave a review for this one
      hotel_id: sunsetStudio.hotel_id,
      guest_id: alice_id,
      check_in_date: future(-10), // already happened
      check_out_date: future(-7),
      num_guests: 2,
      total_price: 89.0 * 3,
      status: "completed",
    },
  ])
  .select("booking_id, hotel_id, guest_id, status, total_price");

if (bookingErr) fail("insert bookings", bookingErr);
const [aliceConfirmed, _bobPending, aliceCompleted] = bookings!;
bookings!.forEach((b) =>
  ok(`booking_id ${b.booking_id} — status: ${b.status} — £${b.total_price}`),
);

// ─── 7. Payments ─────────────────────────────────────────────

log("Inserting payments…");

const { error: payErr } = await supabase.from("payments").insert([
  {
    booking_id: aliceConfirmed.booking_id,
    amount: aliceConfirmed.total_price,
    payment_method: "demo",
    status: "completed",
    transaction_id: "DEMO-001",
  },
  {
    booking_id: aliceCompleted.booking_id,
    amount: aliceCompleted.total_price,
    payment_method: "demo",
    status: "completed",
    transaction_id: "DEMO-002",
  },
]);

if (payErr) fail("insert payments", payErr);
ok("Payments inserted for Alice's confirmed and completed bookings");

// ─── 8. Review ───────────────────────────────────────────────

log("Inserting review for completed stay…");

const { error: reviewErr } = await supabase.from("reviews").insert({
  hotel_id: sunsetStudio.hotel_id,
  guest_id: alice_id,
  booking_id: aliceCompleted.booking_id,
  rating: 5,
  comment:
    "Absolutely stunning views and incredibly clean. Sarah was a wonderful host!",
});

if (reviewErr) fail("insert review", reviewErr);
ok("Alice left a 5-star review for Sunset Beach Studio");

// ─── 9. Wishlist ─────────────────────────────────────────────

log("Adding hotel to Bob's wishlist…");

const { error: wishErr } = await supabase.from("wishlists").insert({
  guest_id: bob_id,
  hotel_id: sunsetStudio.hotel_id,
});

if (wishErr) fail("insert wishlist", wishErr);
ok("Bob saved Sunset Beach Studio");

// ─── Done ────────────────────────────────────────────────────

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Seed complete

Test credentials
  Host   → host@demo.com   / password123
  Alice  → alice@demo.com  / password123
  Bob    → bob@demo.com    / password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
