-- Ensure the column exists (idempotent) and set firestore_synced = false for all users
BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firestore_synced boolean DEFAULT false;
UPDATE users SET firestore_synced = false;
COMMIT;
