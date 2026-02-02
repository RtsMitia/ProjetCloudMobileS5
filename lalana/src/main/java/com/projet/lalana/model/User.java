package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String email;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(name = "firebase_token", length = 255)
    private String firebaseToken;

    @Column(name = "current_status", columnDefinition = "INTEGER DEFAULT 1")
    private Integer currentStatus;

    @Column(name = "firestore_synced")
    private Boolean firestoreSynced = false;
}
