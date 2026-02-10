package com.projet.lalana.dto;

import java.time.LocalDateTime;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.Signalement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class ProblemeDto {

    /*Probleme */
    private Integer id;
    private Double surface;
    private Double budgetEstime;

    @Min(1)
    @Max(10)
    private Integer niveau;

    private Integer entrepriseId;
    private String entrepriseName;
    private Integer statusId;
    private String statusNom;
    private Integer statusValeur;

    /*Signalement */
    private Integer signalementId;
    private Integer userId;
    private String userEmail;

    private Double x;
    private Double y;
    private String localisation;

    private String description;
    private LocalDateTime createdAt;
    private String statusLibelle;

    public static ProblemeDto fromEntity(Probleme p) {
        if (p == null) return null;
        ProblemeDto d = new ProblemeDto();
        d.setId(p.getId());
        d.setSurface(p.getSurface());
        d.setBudgetEstime(p.getBudgetEstime());
        if (p.getEntreprise() != null) {
            d.setEntrepriseId(p.getEntreprise().getId());
            d.setEntrepriseName(p.getEntreprise().getNom());
        }

        if (p.getProblemeStatus() != null) {
            d.setStatusId(p.getProblemeStatus().getId());
            d.setStatusNom(p.getProblemeStatus().getNom());
            d.setStatusValeur(p.getProblemeStatus().getValeur());
            d.setStatusLibelle(p.getProblemeStatus().getNom());
        }

        if (p.getSignalement() != null) {
            Signalement s = p.getSignalement();
            d.setSignalementId(s.getId());
            if (s.getUser() != null) {
                d.setUserId(s.getUser().getId());
                d.setUserEmail(s.getUser().getEmail());
            }
            if (s.getPoint() != null) {
                d.setX(s.getPoint().getX());
                d.setY(s.getPoint().getY());
                d.setLocalisation(s.getPoint().getLocalisation());
            }
            d.setDescription(s.getDescription());
            d.setCreatedAt(s.getCreatedAt());
        }

        // Niveau de réparation / criticité
        d.setNiveau(p.getNiveau());

        return d;
    }

}