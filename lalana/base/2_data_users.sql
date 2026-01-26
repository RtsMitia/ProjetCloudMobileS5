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
