package com.projet.lalana.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.SignalementImage;

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
    private List<SignalementImageDTO> images;

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
            
            List<SignalementImageDTO> imageDtos = new ArrayList<>();
            try {
                System.out.println("ProblemeDto.fromEntity - Probleme ID: " + p.getId() + ", Signalement ID: " + s.getId());
                if (s.getImages() != null) {
                    System.out.println("ProblemeDto.fromEntity - Images collection is not null, size: " + s.getImages().size());
                    for (SignalementImage img : s.getImages()) {
                        System.out.println("ProblemeDto.fromEntity - Processing image: " + img.getNomFichier());
                        SignalementImageDTO imgDto = new SignalementImageDTO();
                        imgDto.setCheminLocal(img.getCheminLocal());
                        imgDto.setCheminOnline(img.getCheminOnline());
                        imgDto.setNomFichier(img.getNomFichier());
                        imageDtos.add(imgDto);
                    }
                    System.out.println("ProblemeDto.fromEntity - Total images mapped: " + imageDtos.size());
                } else {
                    System.out.println("ProblemeDto.fromEntity - Images collection is NULL (lazy loading failed?)");
                }
            } catch (Exception e) {
                System.err.println("ProblemeDto.fromEntity - ERROR loading images for signalement " + s.getId() + ": " + e.getClass().getName() + " - " + e.getMessage());
                e.printStackTrace();
            }
            d.setImages(imageDtos);
            System.out.println("ProblemeDto.fromEntity - Final DTO has " + (d.getImages() != null ? d.getImages().size() : 0) + " images");
        }

        d.setNiveau(p.getNiveau());

        return d;
    }

}