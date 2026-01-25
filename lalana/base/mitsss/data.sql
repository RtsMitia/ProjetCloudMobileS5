-- Test data for corrected schema (no role on users)

-- Signalement statuses
INSERT INTO signalement_status (id, nom, description) VALUES
(1, 'Nouveau', 'Signalement nouvellement créé'),
(2, 'En cours', 'Signalement en cours de traitement'),
(3, 'Résolu', 'Signalement traité et résolu');

-- Probleme statuses
INSERT INTO probleme_status (id, nom, description, valeur) VALUES
(1, 'Ouvert', 'Problème ouvert', 10),
(2, 'Assigné', 'Problème assigné à une entreprise', 20),
(3, 'Résolu', 'Travail terminé', 30);

-- Users (no role column)
INSERT INTO users (id, email, password) VALUES
(1, 'admin@example.com', 'adminpass'),
(2, 'user1@example.com', 'userpass');

-- Points
INSERT INTO points (id, x, y, localisation) VALUES
(1, 18.8792, -13.5172, 'Avenue Independence'),
(2, 18.8888, -13.5000, 'Rue des Fleurs');

-- Entreprises
INSERT INTO entreprise (id, nom, adresse, telephone) VALUES
(1, 'Entreprise Travaux SA', '123 Rue Principale, Antananarivo', '+261202000001');

-- Signalements
INSERT INTO signalement (id, user_id, point_id, description, created_at, status_id) VALUES
(1, 2, 1, 'Nid de poule important sur la chaussée', '2026-01-10 09:30:00', 1),
(2, 2, 2, 'Eclairage public en panne', '2026-01-12 20:15:00', 2);

-- Probleme linked to a signalement
INSERT INTO probleme (id, signalement_id, surface, budget_estime, entreprise_id) VALUES
(1, 1, 12.50, 1500.00, 1);

-- History entries
INSERT INTO signalement_history (id, signalement_id, status_id, changed_at) VALUES
(1, 1, 1, '2026-01-10 09:35:00'),
(2, 2, 2, '2026-01-12 21:00:00');

INSERT INTO probleme_history (id, probleme_id, status_id, changed_at) VALUES
(1, 1, 1, '2026-01-11 08:00:00');

-- End of test data for mitsss

