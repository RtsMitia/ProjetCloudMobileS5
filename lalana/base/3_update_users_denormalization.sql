-- =====================
-- SCRIPT D'UPDATE - DENORMALISATION UTILISATEURS
-- =====================
-- Ce script ajoute et initialise les colonnes firebase_token et current_status

-- Step 1: Ajouter la colonne firebase_token si elle n'existe pas
ALTER TABLE users
ADD COLUMN IF NOT EXISTS firebase_token VARCHAR(255);

-- Step 2: Ajouter la colonne current_status si elle n'existe pas
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_status INTEGER;

-- Step 3: Initialiser current_status pour tous les utilisateurs
-- Pour chaque utilisateur, prendre le dernier statut de user_history
UPDATE users u
SET current_status = COALESCE(
    (SELECT status
     FROM users_history uh
     WHERE uh.user_id = u.id
     ORDER BY uh.changed_at DESC
     LIMIT 1
    ),
    -1
)
WHERE u.current_status IS NULL;

-- Step 4: Vérifier et afficher les résultats
SELECT 'Update completed. Users with denormalized status:' as message;
SELECT id, email, firebase_token, current_status FROM users;
