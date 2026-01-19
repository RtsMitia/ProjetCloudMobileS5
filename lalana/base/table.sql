CREATE TABLE points (
    id SERIAL PRIMARY KEY,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    localisation VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role INTEGER NOT NULL 
);

CREATE TABLE signalement(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    point_id INT REFERENCES points(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_signalement(
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

CREATE TABLE probleme (
    id SERIAL PRIMARY KEY,
    signalement_id INT REFERENCES signalement(id),
    surface NUMERIC(10,2) NOT NULL,
    
);

