package com.projet.lalana.repository;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.Signalement;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProblemeRepository extends JpaRepository<Probleme, Integer> {

        @Query("""
            SELECT DISTINCT p FROM Probleme p
            LEFT JOIN FETCH p.signalement s
            LEFT JOIN FETCH s.images
            WHERE p.problemeStatus.valeur <= :valeur
            """)
        List<Probleme> findByValeur(Integer valeur);
    List<Probleme> findByFirestoreSyncedFalse();
    
    @Query("""
        SELECT DISTINCT p FROM Probleme p
        JOIN FETCH p.signalement s
        LEFT JOIN FETCH s.images i
        WHERE p.problemeStatus.valeur != 30 
        """)
    List<Probleme> findAllWithStatusOther();



}
