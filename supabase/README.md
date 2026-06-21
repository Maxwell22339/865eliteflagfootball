# Massage Therapy Client Records — Supabase Backend

This directory contains the complete Supabase backend for a HIPAA-friendly massage therapy client records application.

---

## Directory structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   # Tables, indexes, RLS policies
│   └── 002_storage.sql          # Storage bucket & object policies
├── api/
│   ├── createClient.ts          # Create a new client
│   ├── updateClient.ts          # Update client details
│   ├── createSoapNote.ts        # Add a SOAP note for a session
│   ├── getClientHistory.ts      # Fetch full client history
│   └── deleteSoapNote.ts        # Delete a SOAP note
└── types.ts                     # TypeScript row/insert/update types
```

---

## Database schema

### `clients`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | FK → `auth.users`, set via RLS |
| `first_name` | TEXT | Required |
| `last_name` | TEXT | Required |
| `phone` | TEXT | Optional |
| `email` | TEXT | Optional |
| `date_of_birth` | DATE | Optional |
| `emergency_contact` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | Audit timestamp, auto-set |

### `intake_forms`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `client_id` | UUID | FK → `clients` |
| `medical_conditions` | TEXT | |
| `medications` | TEXT | |
| `allergies` | TEXT | |
| `consent_signed` | BOOLEAN | Defaults to `false` |
| `created_at` | TIMESTAMPTZ | Audit timestamp |

### `soap_notes`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `client_id` | UUID | FK → `clients` |
| `session_date` | DATE | Required |
| `subjective` | TEXT | Client-reported symptoms |
| `objective` | TEXT | Therapist observations |
| `assessment` | TEXT | Clinical assessment |
| `plan` | TEXT | Treatment plan |
| `therapist_name` | TEXT | Required |
| `created_at` | TIMESTAMPTZ | Audit timestamp |

---

## Setup

### 1. Apply migrations

#### Option A — Supabase CLI (recommended)
```bash
supabase db push
```

#### Option B — SQL editor
Run the files in order inside the Supabase dashboard SQL editor:
1. `migrations/001_initial_schema.sql`
2. `migrations/002_storage.sql`

### 2. Install the JS client
```bash
npm install @supabase/supabase-js
```

### 3. Configure environment variables
```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

### 4. Use the typed client
```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

---

## Row Level Security (RLS)

All three tables have RLS **enabled**. Policies ensure:

- **`clients`** — a row is only visible/editable to the user whose `user_id` matches `auth.uid()`.
- **`intake_forms` / `soap_notes`** — a row is only visible/editable when its parent `clients` row is owned by the current user.

No record can be accessed without a valid authenticated session.

---

## Storage: `client-documents`

The `client-documents` bucket is **private** (`public = false`).

Files must be uploaded under the path `<user_id>/<client_id>/<filename>`. Storage RLS policies enforce that the leading path segment matches the authenticated user's UID, preventing cross-user access.

### Example upload
```ts
const filePath = `${session.user.id}/${clientId}/intake-form.pdf`;
const { error } = await supabase.storage
  .from("client-documents")
  .upload(filePath, file, { contentType: "application/pdf" });
```

### Example signed download URL (expires in 60 s)
```ts
const { data, error } = await supabase.storage
  .from("client-documents")
  .createSignedUrl(filePath, 60);
```

---

## HIPAA-friendly practices

| Practice | Implementation |
|---|---|
| Authentication required | All table and storage policies check `auth.uid()` |
| Audit timestamps | `created_at` on every table, auto-set by the database |
| Secure file storage | Private bucket + per-user path prefix enforced by RLS |
| No public access | `public = false` on the bucket; all table RLS denies anonymous access |
| Data isolation | `user_id` FK + RLS ensures strict per-therapist data separation |

> **Note:** For full HIPAA compliance in a production deployment, consult a compliance professional and review Supabase's BAA (Business Associate Agreement) offering.
