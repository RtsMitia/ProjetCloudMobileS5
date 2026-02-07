package com.projet.lalana.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "signalement_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SignalementImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id")
    @JsonIgnore
    private Signalement signalement;

    @Column(name = "chemin_local")
    private String cheminLocal;

    @Column(name = "chemin_online")
    private String cheminOnline;

    @Column(name = "nom_fichier")
    private String nomFichier;
}
