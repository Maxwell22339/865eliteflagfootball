// ============================================================
// API Example: Create SOAP Note
// ============================================================
// The parent client must belong to the authenticated user
// (enforced by RLS on soap_notes via a subquery on clients).

import { createClient } from "@supabase/supabase-js";
import type { Database, SoapNoteInsert, SoapNoteRow } from "../types";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function createSoapNote(
  payload: SoapNoteInsert
): Promise<SoapNoteRow> {
  const { data, error } = await supabase
    .from("soap_notes")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --------------- Example usage ---------------
// const note = await createSoapNote({
//   client_id: "client-uuid-here",
//   session_date: "2026-06-21",
//   subjective: "Client reports tension in upper back and neck.",
//   objective: "Moderate hypertonicity in trapezius bilaterally.",
//   assessment: "Progress noted; 70% improvement from previous session.",
//   plan: "Continue weekly sessions; focus on cervical release.",
//   therapist_name: "Alex Rivera, LMT",
// });
