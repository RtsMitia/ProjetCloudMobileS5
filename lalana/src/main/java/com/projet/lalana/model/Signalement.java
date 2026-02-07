package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import java.util.List;

@Entity
@Table(name = "signalement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_id")
    private Point point;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private SignalementStatus status;

    @Column(name = "firestore_synced", nullable = false , columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean firestoreSynced;

    @OneToMany(mappedBy = "signalement", fetch = FetchType.LAZY)
    private List<SignalementImage> images;
}
