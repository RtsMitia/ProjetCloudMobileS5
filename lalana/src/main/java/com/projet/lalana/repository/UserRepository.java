package com.projet.lalana.repository;

import com.projet.lalana.model.User;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByFirebaseToken(String firebaseToken);

    @Query("SELECT u FROM User u WHERE u.firestoreSynced = false")
    List<User> findNotSyncedUsers();

}
