// ============================================================
// API Example: Create Client
// ============================================================
// Requires an authenticated Supabase session.
// The user_id column is populated automatically by the RLS policy
// using auth.uid(), so it must not be sent from the client.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, ClientInsert, ClientRow } from "../types";

const supabase = createSupabaseClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function createClient(
  payload: ClientInsert
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --------------- Example usage ---------------
// const newClient = await createClient({
//   first_name: "Jane",
//   last_name: "Doe",
//   phone: "555-123-4567",
//   email: "jane.doe@example.com",
//   date_of_birth: "1985-04-12",
//   emergency_contact: "John Doe – 555-987-6543",
// });
