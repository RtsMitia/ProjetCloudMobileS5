package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "probleme")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Probleme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id")
    private Signalement signalement;

    @Column(nullable = false)
    private Double surface;

    @Column(nullable = false)
    private Double budgetEstime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private ProblemeStatus problemeStatus;

    @Column(name = "firestore_synced", nullable = false)
    private Boolean firestoreSynced = false;
}
