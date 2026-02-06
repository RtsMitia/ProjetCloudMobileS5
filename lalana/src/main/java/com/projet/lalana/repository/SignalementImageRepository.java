package com.projet.lalana.repository;

import com.projet.lalana.model.SignalementImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SignalementImageRepository extends JpaRepository<SignalementImage, Integer> {

}
