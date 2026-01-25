package com.projet.lalana.repository;

import com.projet.lalana.model.ProblemeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProblemeStatusRepository extends JpaRepository<ProblemeStatus, Integer> {
	Optional<ProblemeStatus> findByValeur(Integer valeur);
}
