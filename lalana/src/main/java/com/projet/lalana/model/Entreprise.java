package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "entreprise")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100, nullable = false)
    private String nom;

    @Column(length = 255)
    private String adresse;

    @Column(length = 20)
    private String telephone;
}
