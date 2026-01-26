-- =====================
-- SAMPLE DATA - USERS
-- Idempotent inserts for testing
-- =====================

-- User 1: admin@example.com - active
INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'admin@example.com', 'adminpass', 'firebase-uid-admin', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

-- Ensure history exists for user 1
INSERT INTO users_history (user_id, changed_at, status)
SELECT u.id, NOW(), 1
FROM users u
WHERE u.email = 'admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM users_history uh WHERE uh.user_id = u.id AND uh.status = 1
  );

-- User 2: blocked@example.com - blocked
INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'blocked@example.com', 'blockedpass', 'firebase-uid-blocked', 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'blocked@example.com');

-- Ensure history exists for user 2
INSERT INTO users_history (user_id, changed_at, status)
SELECT u.id, NOW(), 0
FROM users u
WHERE u.email = 'blocked@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM users_history uh WHERE uh.user_id = u.id AND uh.status = 0
  );

-- User 3: no firebase token yet, active locally
INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'no-token@example.com', 'nopass', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'no-token@example.com');

-- Ensure history exists for user 3
INSERT INTO users_history (user_id, changed_at, status)
SELECT u.id, NOW(), 1
FROM users u
WHERE u.email = 'no-token@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM users_history uh WHERE uh.user_id = u.id AND uh.status = 1
  );

-- Optional: show inserted rows (commented out; remove comments to run as script that returns rows)
-- SELECT id, email, firebase_token, current_status FROM users WHERE email IN ('admin@example.com','blocked@example.com','no-token@example.com');

-- =====================
-- Users created by the client HTML (user1..user5)
-- These users are created client-side via import-users-firebase.html; insert matching local rows
-- with NULL firebase_token so the sync will fill the UID later.
-- =====================
INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'user1@test.com', 'password123', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user1@test.com');

INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'user2@test.com', 'password123', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user2@test.com');

INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'user3@test.com', 'password123', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user3@test.com');

INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'user4@test.com', 'password123', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user4@test.com');

INSERT INTO users (email, password, firebase_token, current_status)
SELECT 'user5@test.com', 'password123', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user5@test.com');

-- Ensure history exists for these users
INSERT INTO users_history (user_id, changed_at, status)
SELECT u.id, NOW(), 1
FROM users u
WHERE u.email IN ('user1@test.com','user2@test.com','user3@test.com','user4@test.com','user5@test.com')
  AND NOT EXISTS (
    SELECT 1 FROM users_history uh WHERE uh.user_id = u.id AND uh.status = 1
  );

-- Add an explicit unblocking entry for user3 (user3@test.com)
INSERT INTO users_history (user_id, changed_at, status)
SELECT u.id, NOW(), 1
FROM users u
WHERE u.email = 'user3@test.com'
  AND NOT EXISTS (
    SELECT 1 FROM users_history uh WHERE uh.user_id = u.id AND uh.status = 1
  );

-- Ensure denormalized current_status is set to 1 for user3
UPDATE users u
SET current_status = 1
WHERE u.email = 'user3@test.com' AND (u.current_status IS NULL OR u.current_status <> 1);


