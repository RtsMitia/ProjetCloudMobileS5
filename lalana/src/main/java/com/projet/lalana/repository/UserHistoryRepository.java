package com.projet.lalana.repository;

import com.projet.lalana.model.UserHistory;
import com.projet.lalana.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserHistoryRepository extends JpaRepository<UserHistory, Integer> {

	Optional<UserHistory> findTopByUserOrderByChangedAtDesc(User user);
}
