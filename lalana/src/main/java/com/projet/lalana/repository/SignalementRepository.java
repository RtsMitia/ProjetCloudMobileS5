package com.projet.lalana.repository;

import com.projet.lalana.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SignalementRepository extends JpaRepository<Signalement, Integer> {
	List<Signalement> findByFirestoreSyncedFalse();

	// Return all signalements whose status.valeur <= 10 and not yet synced
	@Query("SELECT s FROM Signalement s WHERE s.status.valeur <= 10 AND s.firestoreSynced = false")
	List<Signalement> findByStatusValeurLE10();

	// Return signalements whose status.valeur = 30
	@Query("SELECT s FROM Signalement s WHERE s.status.valeur = 30")
	List<Signalement> findByStatusValeur30();

	@Query("SELECT s FROM Signalement s JOIN FETCH s.images WHERE s.status.valeur != 30")
	List<Signalement> findAllWithStatusOther();

}
