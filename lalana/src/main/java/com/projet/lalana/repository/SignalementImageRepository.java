package com.projet.lalana.repository;

import com.projet.lalana.model.SignalementImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementImageRepository extends JpaRepository<SignalementImage, Integer> {

    @Query("SELECT i FROM SignalementImage i WHERE i.signalement.id = :signalementId")
    List<SignalementImage> findBySignalementId(@Param("signalementId") Integer signalementId);

}
