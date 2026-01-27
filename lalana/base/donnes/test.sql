-- Points à Madagascar
INSERT INTO points (firestore_synced, localisation, x, y) VALUES
(FALSE, 'Antananarivo - Avenue de l''Independance', -18.9089, 47.5218),
(FALSE, 'Toamasina - Port', -18.1443, 49.3958),
(FALSE, 'Antsirabe - Centre ville', -19.8689, 47.0331),
(FALSE, 'Mahajanga - Boulevard Poincare', -15.7167, 46.3167),
(FALSE, 'Fianarantsoa - Rue du Commerce', -21.4546, 47.0859),
(FALSE, 'Toliara - Cote Ouest', -23.3516, 43.6853),
(FALSE, 'Antsiranana - Baie de Diego', -12.2786, 49.2917),
(FALSE, 'Morondava - Allee des Baobabs', -20.2846, 44.3178);

-- Signalements (5 signalements)
INSERT INTO signalement (created_at, description, firestore_synced, point_id, status_id, user_id) VALUES
('2024-01-15 09:30:00', 'Nid-de-poule important sur la chaussee principale, risque pour les vehicules', FALSE, 1, 1, 1),
('2024-01-16 14:20:00', 'eclairage public defectueux depuis 3 jours, quartier sombre le soir', FALSE, 2, 2, 2),
('2024-01-17 11:45:00', 'Caniveau bouche causant des inondations lors des pluies', FALSE, 3, 1, 1),
('2024-01-18 16:10:00', 'Panneau de signalisation tombe, danger pour la circulation', FALSE, 4, 3, 2),
('2024-01-19 08:15:00', 'Dechets accumules non collectes depuis une semaine, odeurs nauseabondes', FALSE, 5, 2, 1);

-- Problèmes (3 problèmes lies aux signalements)
INSERT INTO probleme (budget_estime, firestore_synced, surface, entreprise_id, status_id, signalement_id) VALUES
(2500000, FALSE, 4.5, 1, 1, 1),   -- Reparation de nid-de-poule
(850000, FALSE, 12.0, 2, 2, 2),   -- Reparation eclairage public
(1500000, FALSE, 8.2, 1, 1, 3);   -- Debouchage caniveau