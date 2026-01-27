package com.projet.lalana.repository;

import com.projet.lalana.model.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Integer> {
    
    // Vérifier si une entreprise existe par son nom
    boolean existsByNom(String nom);
    
    // Rechercher une entreprise par son nom
    Optional<Entreprise> findByNom(String nom);
}