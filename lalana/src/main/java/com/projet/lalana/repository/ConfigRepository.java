package com.projet.lalana.repository;

import com.projet.lalana.model.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigRepository extends JpaRepository<Config, Integer> {
    Optional<Config> findByKey(String key);
}
