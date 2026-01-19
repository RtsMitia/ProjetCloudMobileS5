package com.projet.lalana.repository;

import com.projet.lalana.model.Probleme;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemeRepository extends JpaRepository<Probleme, Integer> {
}
