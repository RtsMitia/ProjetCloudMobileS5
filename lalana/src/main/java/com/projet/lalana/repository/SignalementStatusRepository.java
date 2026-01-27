package com.projet.lalana.repository;


import com.projet.lalana.model.SignalementStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SignalementStatusRepository extends JpaRepository<SignalementStatus, Integer> {
	java.util.List<SignalementStatus> findByFirestoreSyncedFalse();
	Optional<SignalementStatus> findByValeur(Integer valeur);
}
