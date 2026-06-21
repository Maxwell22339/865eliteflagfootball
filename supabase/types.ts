// ============================================================
// Supabase TypeScript Types
// Massage Therapy Client Records
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================
// Row types (what you get back from SELECT)
// ============================================================

export interface ClientRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null; // ISO 8601 date string (YYYY-MM-DD)
  emergency_contact: string | null;
  created_at: string; // ISO 8601 timestamp
}

export interface IntakeFormRow {
  id: string;
  client_id: string;
  medical_conditions: string | null;
  medications: string | null;
  allergies: string | null;
  consent_signed: boolean;
  created_at: string;
}

export interface SoapNoteRow {
  id: string;
  client_id: string;
  session_date: string; // ISO 8601 date string (YYYY-MM-DD)
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  therapist_name: string;
  created_at: string;
}

// ============================================================
// Insert types (what you pass to INSERT)
// ============================================================

export interface ClientInsert {
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  emergency_contact?: string | null;
  // user_id is injected from auth.uid() via RLS — do not send from client
}

export interface IntakeFormInsert {
  client_id: string;
  medical_conditions?: string | null;
  medications?: string | null;
  allergies?: string | null;
  consent_signed?: boolean;
}

export interface SoapNoteInsert {
  client_id: string;
  session_date: string;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  therapist_name: string;
}

// ============================================================
// Update types (all fields optional except primary key)
// ============================================================

export type ClientUpdate = Partial<Omit<ClientInsert, "user_id">>;
export type IntakeFormUpdate = Partial<Omit<IntakeFormInsert, "client_id">>;
export type SoapNoteUpdate = Partial<Omit<SoapNoteInsert, "client_id">>;

// ============================================================
// Database interface (compatible with supabase-js v2 generics)
// ============================================================

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: ClientRow;
        Insert: ClientInsert & { user_id: string };
        Update: ClientUpdate;
      };
      intake_forms: {
        Row: IntakeFormRow;
        Insert: IntakeFormInsert;
        Update: IntakeFormUpdate;
      };
      soap_notes: {
        Row: SoapNoteRow;
        Insert: SoapNoteInsert;
        Update: SoapNoteUpdate;
      };
    };
  };
}
