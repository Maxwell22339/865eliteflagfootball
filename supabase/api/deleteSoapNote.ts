// ============================================================
// API Example: Delete SOAP Note
// ============================================================
// Permanently removes a SOAP note.  The parent client must
// belong to the authenticated user (enforced by RLS).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function deleteSoapNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from("soap_notes")
    .delete()
    .eq("id", noteId);

  if (error) throw new Error(error.message);
}

// --------------- Example usage ---------------
// await deleteSoapNote("soap-note-uuid-here");
