package com.projet.lalana.repository;

import com.projet.lalana.model.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserHistoryRepository extends JpaRepository<UserHistory, Integer> {
}
