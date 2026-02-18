import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import * as dotenv from "dotenv";

// Admin client for scripts (seed, tests, etc.).
// This file MUST NOT be imported by browser code.
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase admin environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SECRET_KEY).",
  );
}

const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin;
