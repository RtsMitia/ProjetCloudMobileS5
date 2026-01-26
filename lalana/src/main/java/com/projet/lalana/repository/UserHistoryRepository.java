package com.projet.lalana.repository;

import com.projet.lalana.model.User;
import com.projet.lalana.model.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserHistoryRepository extends JpaRepository<UserHistory, Integer> {

    /**
     * Find all history records for a user within a time range, ordered by most
     * recent first
     */
    List<UserHistory> findByUserAndChangedAtAfterOrderByChangedAtDesc(User user, LocalDateTime after);

    /**
     * Count failed login attempts for a user since a given time
     */
    @Query("SELECT COUNT(h) FROM UserHistory h WHERE h.user = :user AND h.status = :status AND h.changedAt >= :since")
    long countByUserAndStatusSince(@Param("user") User user, @Param("status") Integer status,
            @Param("since") LocalDateTime since);

    /**
     * Find the most recent lock record for a user
     */
    @Query("SELECT h FROM UserHistory h WHERE h.user = :user AND h.status = :status ORDER BY h.changedAt DESC LIMIT 1")
    Optional<UserHistory> findLatestByUserAndStatus(@Param("user") User user, @Param("status") Integer status);
}
