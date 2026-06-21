-- ============================================================
-- Migration 001: Initial Schema
-- Massage Therapy Client Records
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name       TEXT         NOT NULL,
    last_name        TEXT         NOT NULL,
    phone            TEXT,
    email            TEXT,
    date_of_birth    DATE,
    emergency_contact TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: intake_forms
-- ============================================================
CREATE TABLE IF NOT EXISTS public.intake_forms (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id          UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    medical_conditions TEXT,
    medications        TEXT,
    allergies          TEXT,
    consent_signed     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: soap_notes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.soap_notes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    session_date    DATE        NOT NULL,
    subjective      TEXT,
    objective       TEXT,
    assessment      TEXT,
    plan            TEXT,
    therapist_name  TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id         ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_client_id  ON public.intake_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_client_id    ON public.soap_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_session_date ON public.soap_notes(session_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soap_notes   ENABLE ROW LEVEL SECURITY;

-- clients: only the owning authenticated user may access their rows
CREATE POLICY "clients_select_own" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "clients_insert_own" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update_own" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_delete_own" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- intake_forms: accessible only when the parent client belongs to the user
CREATE POLICY "intake_forms_select_own" ON public.intake_forms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = intake_forms.client_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "intake_forms_insert_own" ON public.intake_forms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = intake_forms.client_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "intake_forms_update_own" ON public.intake_forms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = intake_forms.client_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "intake_forms_delete_own" ON public.intake_forms
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = intake_forms.client_id
              AND c.user_id = auth.uid()
        )
    );

-- soap_notes: accessible only when the parent client belongs to the user
CREATE POLICY "soap_notes_select_own" ON public.soap_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = soap_notes.client_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "soap_notes_insert_own" ON public.soap_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = soap_notes.client_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "soap_notes_update_own" ON public.soap_notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = soap_notes.client_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "soap_notes_delete_own" ON public.soap_notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = soap_notes.client_id
              AND c.user_id = auth.uid()
        )
    );
