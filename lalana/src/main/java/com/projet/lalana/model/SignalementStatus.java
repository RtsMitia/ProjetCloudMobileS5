package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "signalement_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SignalementStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;
}
