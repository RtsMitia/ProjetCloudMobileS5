-- update_script_v4.sql
-- Ajoute la colonne `niveau` à la table `probleme`.
-- Ajoute une colonne entière `niveau` avec valeur par défaut 1 (niveau minimal).
-- Fournit également une instruction de rollback simple.

BEGIN;

-- 1) Ajouter la colonne 'niveau' (integer) avec valeur par défaut 1 et non null
ALTER TABLE probleme
  ADD COLUMN niveau INTEGER DEFAULT 1;

-- 2) S'assurer que les lignes existantes ont bien la valeur par défaut
UPDATE probleme SET niveau = 1 WHERE niveau IS NULL;

-- 3) Rendre la colonne NOT NULL si toutes les lignes sont remplies
ALTER TABLE probleme
  ALTER COLUMN niveau SET NOT NULL;

-- 4) Contraintes: s'assurer que la valeur de 'niveau' reste dans l'intervalle [1,10]
ALTER TABLE probleme
  ADD CONSTRAINT check_probleme_niveau_range CHECK (niveau >= 1 AND niveau <= 10);

COMMIT;

-- Rollback (si nécessaire) :
-- BEGIN;
-- ALTER TABLE probleme DROP COLUMN IF EXISTS niveau;
-- COMMIT;

-- Notes:
-- - Ajustez la valeur par défaut (ici 1) selon la sémantique métier.
-- - Si vous avez besoin d'un mapping plus fin (ex: niveaux par surface), ajoutez
--   une update intermédiaire pour calculer le niveau à partir d'autres colonnes.
-- - Exécuter ce script sur un environnement de staging avant production.


