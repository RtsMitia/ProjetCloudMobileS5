CREATE TABLE points (
    id SERIAL PRIMARY KEY,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    localisation VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role INTEGER NOT NULL 
);

CREATE TABLE users_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER NOT NULL
);

CREATE TABLE signalement(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    point_id INT REFERENCES points(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_id INT REFERENCES status_signalement(id)
    
);
--
CREATE TABLE signalement_status(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE signalement_history(
    id SERIAL PRIMARY KEY,
    signalement_id INT REFERENCES signalement(id),
    status_id INT REFERENCES status_signalement(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entreprise (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    telephone VARCHAR(20)
);

CREATE TABLE probleme_status(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    description TEXT,
    valeur INTEGER NOT NULL
);

CREATE TABLE probleme (
    id SERIAL PRIMARY KEY,
    signalement_id INT REFERENCES signalement(id),
    surface NUMERIC(10,2) NOT NULL,
    budget_estime NUMERIC(15,2) NOT NULL,
    entreprise_id INT REFERENCES entreprise(id)
);


CREATE TABLE probleme_history(
    id SERIAL PRIMARY KEY,
    probleme_id INT REFERENCES probleme(id),
    status_id INT REFERENCES status_probleme(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

