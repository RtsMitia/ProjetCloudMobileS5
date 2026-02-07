package com.projet.lalana.repository;

import com.projet.lalana.model.ProblemeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProblemeHistoryRepository extends JpaRepository<ProblemeHistory, Integer> {
    
    /**
     * Récupère l'historique des statuts d'un problème, trié par date croissante
     */
    @Query("SELECT ph FROM ProblemeHistory ph WHERE ph.probleme.id = :problemeId ORDER BY ph.changedAt ASC")
    List<ProblemeHistory> findByProblemeIdOrderByChangedAtAsc(@Param("problemeId") Integer problemeId);
}
