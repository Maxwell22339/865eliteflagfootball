// ============================================================
// API Example: View Client History
// ============================================================
// Returns the client profile, all intake forms, and all SOAP
// notes (ordered newest-first) for the given client ID.
// Only accessible if the client belongs to the authenticated user.

import { createClient } from "@supabase/supabase-js";
import type { Database, ClientRow, IntakeFormRow, SoapNoteRow } from "../types";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface ClientHistory {
  client: ClientRow;
  intakeForms: IntakeFormRow[];
  soapNotes: SoapNoteRow[];
}

export async function getClientHistory(
  clientId: string
): Promise<ClientHistory> {
  const [clientResult, intakeResult, notesResult] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase
      .from("intake_forms")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("soap_notes")
      .select("*")
      .eq("client_id", clientId)
      .order("session_date", { ascending: false }),
  ]);

  if (clientResult.error) throw new Error(clientResult.error.message);
  if (intakeResult.error) throw new Error(intakeResult.error.message);
  if (notesResult.error) throw new Error(notesResult.error.message);

  return {
    client: clientResult.data,
    intakeForms: intakeResult.data ?? [],
    soapNotes: notesResult.data ?? [],
  };
}

// --------------- Example usage ---------------
// const history = await getClientHistory("client-uuid-here");
// console.log(history.client.first_name, history.soapNotes.length, "sessions");
