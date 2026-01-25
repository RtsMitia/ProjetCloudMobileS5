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

INSERT INTO signalement_history (id, signalement_id, status_id, changed_at) VALUES
(1, 1, 1, '2026-01-10 09:35:00'),
(2, 2, 2, '2026-01-12 21:00:00');

INSERT INTO probleme_history (id, probleme_id, status_id, changed_at) VALUES
(1, 1, 1, '2026-01-11 08:00:00');



-- Additional rows to test Firestore sync (explicitly unsynced)
INSERT INTO points (id, x, y, localisation, firestore_synced) VALUES
(3, 18.8900, -13.4800, 'Boulevard Test A', FALSE),
(4, 18.8950, -13.4900, 'Avenue Test B', FALSE);

INSERT INTO signalement_status (id, nom, description, firestore_synced) VALUES
(4, 'TestSync', 'Status used to test Firestore sync', FALSE);

INSERT INTO signalement (id, user_id, point_id, description, created_at, status_id, firestore_synced) VALUES
(3, 1, 3, 'Test signalement sync 1', '2026-01-20 10:00:00', 4, FALSE),
(4, 1, 4, 'Test signalement sync 2', '2026-01-21 11:00:00', 1, FALSE);

-- Probleme statuses to test Firestore sync
INSERT INTO probleme_status (id, nom, description, valeur, firestore_synced) VALUES
(4, 'TestProblemeStatus', 'Probleme status used to test Firestore sync', 40, FALSE);

-- Problemes to test Firestore sync (link to signalements)
INSERT INTO probleme (id, signalement_id, surface, budget_estime, entreprise_id, firestore_synced) VALUES
(2, 3, 5.25, 500.00, 1, FALSE),
(3, 4, 8.75, 900.00, 1, FALSE);

