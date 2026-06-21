// ============================================================
// API Example: Update Client
// ============================================================
// Only the authenticated user who owns the client record can
// update it (enforced by RLS).

import { createClient } from "@supabase/supabase-js";
import type { Database, ClientUpdate, ClientRow } from "../types";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function updateClient(
  clientId: string,
  updates: ClientUpdate
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", clientId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --------------- Example usage ---------------
// const updated = await updateClient("client-uuid-here", {
//   phone: "555-000-1111",
//   emergency_contact: "Jane Smith – 555-222-3333",
// });
