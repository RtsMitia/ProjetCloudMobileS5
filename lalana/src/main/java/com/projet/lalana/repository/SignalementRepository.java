package com.projet.lalana.repository;

import com.projet.lalana.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalementRepository extends JpaRepository<Signalement, Integer> {
}
