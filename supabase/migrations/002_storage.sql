-- ============================================================
-- Migration 002: Storage Bucket for Client Documents
-- ============================================================

-- Create the private bucket for intake forms and signed consent documents.
-- public = false ensures no unauthenticated downloads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- Files are stored under a path prefix of the authenticated user's UID,
-- e.g. "<user_id>/<client_id>/filename.pdf"
-- This guarantees one user cannot read or write another user's files.

CREATE POLICY "storage_select_own" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'client-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

CREATE POLICY "storage_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'client-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

CREATE POLICY "storage_update_own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'client-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

CREATE POLICY "storage_delete_own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'client-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );
