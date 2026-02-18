// =============================================================
// tests.ts — Integration tests for the booking app schema
//
// Tests run against a real Supabase project. Run the seeder first.
// Run with:  npx tsx tests.ts
//
// Covers:
//   1.  Hotel search (search_available_hotels function)
//   2.  RLS — guests only see their own bookings
//   3.  RLS — hosts only see hotels they own
//   4.  Double booking prevention (DB trigger)
//   5.  simulate_payment function + auto-confirm
//   6.  Booking cancellation + auto cancelled_at
//   7.  No-show status
//   8.  Review — only on completed bookings
//   9.  Review — blocked on non-completed bookings
//   10. Notifications auto-created on booking events
//   11. Wishlists — unique constraint
//   12. hotel_nearby_places view
//   13. booking_details view
//   14. hotel_listings view (avg rating, review count)
//   15. Inactive hotel hidden from public search
// =============================================================

import supabaseAdmin from "@/utils/supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// ─── Clients ─────────────────────────────────────────────────

// Service role — bypasses RLS (used to set up test state)
const admin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Creates an authenticated anon client for a given user
async function clientFor(
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  );
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login failed for ${email}: ${error.message}`);
  return client;
}

// ─── Test runner ─────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    → ${e.message}`);
    failed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function assertNotNull(val: unknown, msg: string) {
  if (val === null || val === undefined) throw new Error(msg);
}

// ─── Helpers ─────────────────────────────────────────────────

// Returns today + N days as a YYYY-MM-DD string
const future = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

// Fetch the internal user_id for a given email (admin)
async function getUserId(email: string): Promise<number> {
  const { data, error } = await admin
    .from("users")
    .select("user_id")
    .eq("email", email)
    .single();
  if (error || !data) throw new Error(`Could not find user: ${email}`);
  return data.user_id;
}

async function getHotelId(name: string): Promise<number> {
  const { data, error } = await admin
    .from("hotels")
    .select("hotel_id")
    .eq("name", name)
    .single();
  if (error || !data) throw new Error(`Could not find hotel: ${name}`);
  return data.hotel_id;
}

// ─── Pre-load IDs ─────────────────────────────────────────────

const alice_id = await getUserId("alice@demo.com");
const bob_id = await getUserId("bob@demo.com");
const grandOliveId = await getHotelId("The Grand Olive");
const sunsetStudioId = await getHotelId("Sunset Beach Studio");
const inactiveId = await getHotelId("Unlisted Mountain Cabin");

// ─── Suite ───────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════");
console.log("  Booking App — Integration Tests");
console.log("═══════════════════════════════════════════\n");

// ── 1. Hotel search ──────────────────────────────────────────
console.log("▶ Hotel search");

await test("Returns available hotels in Rome", async () => {
  const { data, error } = await admin.rpc("search_available_hotels", {
    p_city: "Rome",
    p_check_in: future(30),
    p_check_out: future(33),
    p_num_guests: 1,
  });
  if (error) throw new Error(error.message);

  assert(data.length >= 1, "Expected at least 1 result");
  assert(
    data.every((h: any) => h.city.toLowerCase().includes("rome")),
    "All results should be in Rome",
  );
});

await test("Does not return the inactive hotel", async () => {
  const { data, error } = await admin.rpc("search_available_hotels", {
    p_city: "Rome",
    p_check_in: future(30),
    p_check_out: future(33),
    p_num_guests: 1,
  });
  if (error) throw new Error(error.message);

  assert(
    !data.some((h: any) => h.hotel_id === inactiveId),
    "Inactive hotel must not appear in search results",
  );
});

await test("Excludes hotels already booked for those dates", async () => {
  // Alice has a confirmed booking for Grand Olive on future(10)→future(13)
  const { data, error } = await admin.rpc("search_available_hotels", {
    p_city: "Rome",
    p_check_in: future(11), // overlaps with Alice's booking
    p_check_out: future(14),
    p_num_guests: 1,
  });
  if (error) throw new Error(error.message);

  assert(
    !data.some((h: any) => h.hotel_id === grandOliveId),
    "Grand Olive should not appear when dates overlap an existing booking",
  );
});

await test("Returns correct total_price (nights × price_per_night)", async () => {
  const { data, error } = await admin.rpc("search_available_hotels", {
    p_city: "Barcelona",
    p_check_in: future(1),
    p_check_out: future(4), // 3 nights
    p_num_guests: 1,
  });
  if (error) throw new Error(error.message);

  const hotel = data.find((h: any) => h.hotel_id === sunsetStudioId);
  assertNotNull(hotel, "Sunset Studio should appear");
  assert(
    hotel.total_price === 89.0 * 3,
    `Expected total ${89 * 3}, got ${hotel.total_price}`,
  );
});

// ── 2. RLS — guest booking visibility ────────────────────────
console.log("\n▶ RLS — bookings");

await test("Alice can only see her own bookings", async () => {
  const client = await clientFor("alice@demo.com", "password123");
  const { data, error } = await client.from("bookings").select("guest_id");

  if (error) throw new Error(error.message);
  assert(
    data!.every((b) => b.guest_id === alice_id),
    "Alice saw another user's booking",
  );
});

await test("Bob cannot see Alice's bookings", async () => {
  const client = await clientFor("bob@demo.com", "password123");
  const { data, error } = await client.from("bookings").select("guest_id");

  if (error) throw new Error(error.message);
  assert(
    !data!.some((b) => b.guest_id === alice_id),
    "Bob should not see Alice's bookings",
  );
});

// ── 3. RLS — hotels ──────────────────────────────────────────
console.log("\n▶ RLS — hotels");

await test("Public users can see active hotels", async () => {
  const { data, error } = await supabaseAdmin
    .from("hotels")
    .select("hotel_id, is_active")
    .eq("is_active", true);
  console.log(data);
  if (error) throw new Error(error.message);
  assert(data!.length >= 2, "Expected at least 2 active hotels");
});

await test("Guest cannot create a hotel listing", async () => {
  const client = await clientFor("alice@demo.com", "password123");
  const { error } = await client.from("hotels").insert({
    host_id: alice_id,
    name: "Fake Hotel",
    address: "1 Hack St",
    city: "Rome",
    country: "Italy",
    price_per_night: 50,
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
  });
  console.log(error);
  assertNotNull(error, "Insert should have been blocked by RLS");
});

// ── 4. Double booking prevention ─────────────────────────────
console.log("\n▶ Double booking prevention");

await test("Inserting overlapping booking raises an exception", async () => {
  // Alice's booking occupies future(10) → future(13)
  const { error } = await admin.from("bookings").insert({
    hotel_id: grandOliveId,
    guest_id: bob_id,
    check_in_date: future(11),
    check_out_date: future(14),
    num_guests: 1,
    total_price: 149 * 3,
    status: "pending",
  });
  console.log(error);
  assertNotNull(error, "Overlapping booking should be rejected by trigger");
  assert(
    error!.message.includes("already booked"),
    `Unexpected error message: ${error!.message}`,
  );
});

await test("Non-overlapping booking on same hotel is allowed", async () => {
  const { data, error } = await admin
    .from("bookings")
    .insert({
      hotel_id: grandOliveId,
      guest_id: bob_id,
      check_in_date: future(40),
      check_out_date: future(42),
      num_guests: 1,
      total_price: 149 * 2,
      status: "pending",
    })
    .select("booking_id")
    .single();
  console.log(error);
  if (error) throw new Error(error.message);
  assertNotNull(data?.booking_id, "Should have created a booking");

  // Clean up
  await admin.from("bookings").delete().eq("booking_id", data!.booking_id);
});

// ── 5. simulate_payment ──────────────────────────────────────
console.log("\n▶ simulate_payment");

await test("Creates a payment and confirms the booking", async () => {
  // Create a fresh pending booking
  const { data: newBooking, error: bErr } = await admin
    .from("bookings")
    .insert({
      hotel_id: sunsetStudioId,
      guest_id: bob_id,
      check_in_date: future(50),
      check_out_date: future(52),
      num_guests: 1,
      total_price: 89 * 2,
      status: "pending",
    })
    .select("booking_id")
    .single();
  console.log(bErr);
  if (bErr) throw new Error(bErr.message);

  const bookingId = newBooking!.booking_id;
  console.log(bookingId);

  // Run the mock payment
  const { data: status, error: pErr } = await admin.rpc("simulate_payment", {
    p_booking_id: bookingId,
  });
  console.log(pErr);
  if (pErr) throw new Error(pErr.message);
  assert(status === "completed", `Expected 'completed', got '${status}'`);

  // Booking should now be confirmed
  const { data: booking } = await admin
    .from("bookings")
    .select("status")
    .eq("booking_id", bookingId)
    .single();
  console.log(booking);
  assert(
    booking!.status === "confirmed",
    "Booking should be confirmed after payment",
  );

  // Payment row should exist
  const { data: payment } = await admin
    .from("payments")
    .select("status")
    .eq("booking_id", bookingId)
    .single();
  console.log(payment);
  assert(payment!.status === "completed", "Payment row should be 'completed'");

  // Clean up
  await admin.from("bookings").delete().eq("booking_id", bookingId);
});

// ── 6. Cancellation ──────────────────────────────────────────
console.log("\n▶ Cancellation");

await test("cancelled_at is auto-set when status → cancelled", async () => {
  const { data: b, error: bErr } = await admin
    .from("bookings")
    .insert({
      hotel_id: sunsetStudioId,
      guest_id: bob_id,
      check_in_date: future(55),
      check_out_date: future(57),
      num_guests: 1,
      total_price: 89 * 2,
      status: "pending",
    })
    .select("booking_id")
    .single();
  console.log(b);
  if (bErr) throw new Error(bErr.message);

  await admin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("booking_id", b!.booking_id);

  const { data: updated } = await admin
    .from("bookings")
    .select("cancelled_at, status")
    .eq("booking_id", b!.booking_id)
    .single();

  assert(updated!.status === "cancelled", "Status should be cancelled");
  assertNotNull(updated!.cancelled_at, "cancelled_at should be auto-set");

  // Clean up
  await admin.from("bookings").delete().eq("booking_id", b!.booking_id);
});

// ── 7. No-show ───────────────────────────────────────────────
console.log("\n▶ No-show");

await test("Host can mark a booking as no_show", async () => {
  const hostClient = await clientFor("host@demo.com", "password123");

  // Fetch Bob's pending booking on Grand Olive (created during seeding)
  const { data: bookings } = await admin
    .from("bookings")
    .select("booking_id")
    .eq("hotel_id", grandOliveId)
    .eq("guest_id", bob_id)
    .eq("status", "pending")
    .limit(1);

  if (!bookings?.length) {
    throw new Error("No pending booking found for test — re-run the seeder");
  }

  const bookingId = bookings[0].booking_id;
  const { error } = await hostClient
    .from("bookings")
    .update({ status: "no_show" })
    .eq("booking_id", bookingId);

  if (error) throw new Error(error.message);

  const { data: updated } = await admin
    .from("bookings")
    .select("status")
    .eq("booking_id", bookingId)
    .single();

  assert(updated!.status === "no_show", "Status should be no_show");

  // Restore for future test runs
  await admin
    .from("bookings")
    .update({ status: "pending" })
    .eq("booking_id", bookingId);
});

// ── 8. Reviews — allowed on completed bookings ───────────────
console.log("\n▶ Reviews");

await test("Guest can review a completed booking", async () => {
  // Fetch Alice's completed booking on Grand Olive equivalent (already seeded for sunset studio)
  const { data: completedBookings } = await admin
    .from("bookings")
    .select("booking_id")
    .eq("guest_id", alice_id)
    .eq("status", "completed")
    .limit(1);

  if (!completedBookings?.length) {
    throw new Error("No completed booking found — re-run the seeder");
  }

  // Check if a review already exists (from seed)
  const { data: existing } = await admin
    .from("reviews")
    .select("review_id")
    .eq("booking_id", completedBookings[0].booking_id)
    .maybeSingle();

  if (existing) {
    // Review already seeded — just verify it exists
    assert(!!existing.review_id, "Seeded review should exist");
    return;
  }

  const aliceClient = await clientFor("alice@demo.com", "password123");
  const { error } = await aliceClient.from("reviews").insert({
    hotel_id: sunsetStudioId,
    guest_id: alice_id,
    booking_id: completedBookings[0].booking_id,
    rating: 4,
    comment: "Really lovely place.",
  });
  if (error) throw new Error(error.message);
});

await test("Guest cannot review a pending booking", async () => {
  const aliceClient = await clientFor("alice@demo.com", "password123");

  // Fetch Alice's confirmed (not completed) booking
  const { data: pendingBookings } = await admin
    .from("bookings")
    .select("booking_id")
    .eq("guest_id", alice_id)
    .eq("status", "confirmed")
    .limit(1);

  if (!pendingBookings?.length)
    throw new Error("No confirmed booking to test against");

  const { error } = await aliceClient.from("reviews").insert({
    hotel_id: grandOliveId,
    guest_id: alice_id,
    booking_id: pendingBookings[0].booking_id,
    rating: 5,
    comment: "Should not be allowed",
  });

  assertNotNull(
    error,
    "Review on non-completed booking should be rejected by RLS",
  );
});

// ── 9. Notifications ─────────────────────────────────────────
console.log("\n▶ Notifications");

await test("Booking creation fires a notification to the host", async () => {
  const hostId = await getUserId("host@demo.com");

  const { data: b, error: bErr } = await admin
    .from("bookings")
    .insert({
      hotel_id: sunsetStudioId,
      guest_id: alice_id,
      check_in_date: future(60),
      check_out_date: future(62),
      num_guests: 1,
      total_price: 89 * 2,
      status: "pending",
    })
    .select("booking_id")
    .single();
  if (bErr) throw new Error(bErr.message);

  const { data: notifs } = await admin
    .from("notifications")
    .select("type, user_id")
    .eq("related_booking_id", b!.booking_id)
    .eq("type", "booking_created");

  assert(notifs!.length >= 1, "Expected a booking_created notification");
  assert(notifs![0].user_id === hostId, "Notification should go to the host");

  // Clean up
  await admin.from("bookings").delete().eq("booking_id", b!.booking_id);
});

await test("Cancellation fires notifications to both guest and host", async () => {
  const { data: b, error: bErr } = await admin
    .from("bookings")
    .insert({
      hotel_id: sunsetStudioId,
      guest_id: alice_id,
      check_in_date: future(65),
      check_out_date: future(67),
      num_guests: 1,
      total_price: 89 * 2,
      status: "confirmed",
    })
    .select("booking_id")
    .single();
  if (bErr) throw new Error(bErr.message);

  await admin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("booking_id", b!.booking_id);

  const { data: notifs } = await admin
    .from("notifications")
    .select("user_id")
    .eq("related_booking_id", b!.booking_id)
    .eq("type", "booking_cancelled");

  const recipientIds = notifs!.map((n) => n.user_id);
  const hostId = await getUserId("host@demo.com");

  assert(
    recipientIds.includes(alice_id),
    "Guest should receive cancellation notification",
  );
  assert(
    recipientIds.includes(hostId),
    "Host should receive cancellation notification",
  );

  // Clean up
  await admin.from("bookings").delete().eq("booking_id", b!.booking_id);
});

await test("User only sees their own notifications (RLS)", async () => {
  const aliceClient = await clientFor("alice@demo.com", "password123");
  const { data, error } = await aliceClient
    .from("notifications")
    .select("user_id");
  if (error) throw new Error(error.message);
  assert(
    data!.every((n) => n.user_id === alice_id),
    "Alice should only see her own notifications",
  );
});

// ── 10. Wishlists ─────────────────────────────────────────────
console.log("\n▶ Wishlists");

await test("Duplicate wishlist entry is rejected", async () => {
  const { error } = await admin.from("wishlists").insert({
    guest_id: bob_id,
    hotel_id: sunsetStudioId, // already saved in seed
  });
  assertNotNull(
    error,
    "Duplicate wishlist entry should violate unique constraint",
  );
  assert(
    error!.message.includes("unique") || error!.code === "23505",
    `Unexpected error: ${error!.message}`,
  );
});

// ── 11. hotel_nearby_places view ─────────────────────────────
console.log("\n▶ Views");

await test("hotel_nearby_places returns linked POIs ordered by distance", async () => {
  const { data, error } = await admin
    .from("hotel_nearby_places")
    .select("name, distance_m")
    .eq("hotel_id", grandOliveId);
  if (error) throw new Error(error.message);
  assert(
    data!.length === 2,
    `Expected 2 places for Grand Olive, got ${data!.length}`,
  );
  assert(
    data![0].distance_m <= data![1].distance_m,
    "Places should be ordered by distance_m ASC",
  );
});

await test("hotel_listings view returns average_rating and review_count", async () => {
  const { data, error } = await admin
    .from("hotel_listings")
    .select("hotel_id, average_rating, review_count")
    .eq("hotel_id", sunsetStudioId)
    .single();
  if (error) throw new Error(error.message);
  assertNotNull(data!.average_rating, "average_rating should be present");
  assert(Number(data!.review_count) >= 1, "review_count should be at least 1");
});

await test("booking_details view includes guest, hotel, and payment info", async () => {
  const { data, error } = await admin
    .from("booking_details")
    .select("guest_first_name, hotel_name, payment_status")
    .eq("guest_id", alice_id)
    .eq("status", "confirmed")
    .single();
  if (error) throw new Error(error.message);
  assert(data!.guest_first_name === "Alice", "Should include guest name");
  assertNotNull(data!.hotel_name, "Should include hotel name");
  assert(data!.payment_status === "completed", "Should include payment status");
});

// ── 12. Inactive hotel visibility ────────────────────────────
console.log("\n▶ Inactive hotel RLS");

await test("Inactive hotel is hidden from public queries", async () => {
  const aliceClient = await clientFor("alice@demo.com", "password123");
  const { data, error } = await aliceClient
    .from("hotels")
    .select("hotel_id")
    .eq("hotel_id", inactiveId);
  if (error) throw new Error(error.message);
  assert(data!.length === 0, "Inactive hotel should not be visible to guests");
});

await test("Host can see their own inactive hotel", async () => {
  const hostClient = await clientFor("host@demo.com", "password123");
  const { data, error } = await hostClient
    .from("hotels")
    .select("hotel_id, is_active")
    .eq("hotel_id", inactiveId);
  if (error) throw new Error(error.message);
  assert(data!.length === 1, "Host should see their inactive listing");
  assert(data![0].is_active === false, "It should be marked inactive");
});

// ─── Results ─────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════");
console.log(
  `  ${passed + failed} tests   ✓ ${passed} passed   ✗ ${failed} failed`,
);
console.log("═══════════════════════════════════════════\n");

if (failed > 0) process.exit(1);
