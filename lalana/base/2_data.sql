-- Test data for corrected schema (no role on users)

-- Signalement statuses
INSERT INTO signalement_status (nom, description, firestore_synced, valeur) VALUES
('Nouveau', 'Signalement nouvellement créé', FALSE, 10),
('En cours', 'Signalement en cours de traitement', FALSE, 20),
('Résolu', 'Signalement traité et résolu', FALSE, 30);

-- Probleme statuses
INSERT INTO probleme_status (nom, description, valeur, firestore_synced) VALUES
('Ouvert', 'Problème ouvert', 10, FALSE),
('Assigné', 'Problème assigné à une entreprise', 20, FALSE),
('Résolu', 'Travail terminé', 30, FALSE);

-- Points (Antananarivo, Madagascar) - spread out across the city
INSERT INTO points (x, y, localisation, firestore_synced) VALUES
(-18.879190, 47.507905, 'Antananarivo - Analakely', FALSE),
(-18.913200, 47.531600, 'Antananarivo - Isoraka', FALSE),
(-18.914600, 47.507200, 'Antananarivo - Andohalo', FALSE);

-- Users (no role column)
INSERT INTO users (email, password) VALUES
('alice@example.com', 'mitiamitia'),
('bob@example.com', 'mitiamitia');

-- Entreprises
INSERT INTO entreprise (nom, adresse, telephone) VALUES
('Entreprise A', '1 Rue Exemple, 75001 Paris', '0123456789'),
('Entreprise B', '2 Avenue Exemple, 69001 Lyon', '0987654321');

-- Signalements (reference other rows by selecting inserted values)
INSERT INTO signalement (user_id, point_id, description, status_id, firestore_synced) VALUES
((SELECT id FROM users WHERE email='alice@example.com'), (SELECT id FROM points WHERE localisation='Antananarivo - Analakely'), 'Nid-de-poule important sur la chaussée', (SELECT id FROM signalement_status WHERE nom='Nouveau'), FALSE),
((SELECT id FROM users WHERE email='bob@example.com'), (SELECT id FROM points WHERE localisation='Antananarivo - Isoraka'), 'Câble tombé, danger pour les piétons', (SELECT id FROM signalement_status WHERE nom='En cours'), FALSE);

-- Problemes (attach to signalements, entreprises and statuses)
INSERT INTO probleme (signalement_id, surface, budget_estime, entreprise_id, status_id, firestore_synced) VALUES
((SELECT id FROM signalement WHERE description='Nid-de-poule important sur la chaussée'), 4.50, 300.00, (SELECT id FROM entreprise WHERE nom='Entreprise A'), (SELECT id FROM probleme_status WHERE nom='Ouvert'), FALSE),
((SELECT id FROM signalement WHERE description='Câble tombé, danger pour les piétons'), 1.20, 120.00, (SELECT id FROM entreprise WHERE nom='Entreprise B'), (SELECT id FROM probleme_status WHERE nom='Assigné'), FALSE);

-- Signalement history (minimal)
INSERT INTO signalement_history (signalement_id, status_id) VALUES
((SELECT id FROM signalement WHERE description='Nid-de-poule important sur la chaussée'), (SELECT id FROM signalement_status WHERE nom='Nouveau')),
((SELECT id FROM signalement WHERE description='Câble tombé, danger pour les piétons'), (SELECT id FROM signalement_status WHERE nom='En cours'));

-- Probleme history (minimal)
INSERT INTO probleme_history (probleme_id, status_id) VALUES
((SELECT id FROM probleme WHERE surface = 4.50), (SELECT id FROM probleme_status WHERE nom='Ouvert')),
((SELECT id FROM probleme WHERE surface = 1.20), (SELECT id FROM probleme_status WHERE nom='Assigné'));


