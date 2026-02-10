-- Creation de la table config pour stocker les parametres de configuration
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    valeur VARCHAR(255) NOT NULL
);

-- Insertion de la valeur PM2 (Prix par metre carre)
-- Exemple: PM2 = 5000 (ajustez selon vos besoins)
INSERT INTO config (key, valeur) VALUES ('PM2', '5000') ON CONFLICT (key) DO NOTHING;

-- Pour mettre a jour la valeur PM2 si elle existe deja:
-- UPDATE config SET valeur = '5000' WHERE key = 'PM2';
