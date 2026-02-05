CREATE TABLE signalement_images (
    id SERIAL PRIMARY KEY,
    signalement_id INTEGER REFERENCES signalement(id),
    chemin_local VARCHAR(200),
    chemin_online VARCHAR(200),
    nom_fichier VARCHAR(200)
);

