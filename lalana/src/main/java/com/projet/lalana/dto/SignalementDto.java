package com.projet.lalana.dto;

import com.projet.lalana.model.Point;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.SignalementImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementDto {

    private Integer id;
    private Integer userId;
    private String userToken; 

    private Double x; 
    private Double y; 
    private String localisation; 

    private String description; 
    private LocalDateTime createdAt; 

    private String statusLibelle;
    private Integer valeur; 
    private List<SignalementImageDTO> images;

    public static SignalementDto fromEntity(Signalement s) {
        if (s == null) return null;
        SignalementDto.SignalementDtoBuilder b = SignalementDto.builder()
                .id(s.getId())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .userToken(s.getUser() != null ? s.getUser().getFirebaseToken() : null)
                .description(s.getDescription())
                .createdAt(s.getCreatedAt());
        Point p = s.getPoint();
        if (p != null) {
            b.x(p.getX()).y(p.getY()).localisation(p.getLocalisation());
        }

        if (s.getStatus() != null) {
            b.statusLibelle(s.getStatus().getNom());
            b.valeur(s.getStatus().getValeur());
        }

        // Map images from entity
        SignalementDto dto = b.build();
        List<SignalementImageDTO> imageDtos = new ArrayList<>();
        try {
            System.out.println("SignalementDto.fromEntity - Signalement ID: " + s.getId());
            if (s.getImages() != null) {
                System.out.println("SignalementDto.fromEntity - Images collection is not null, size: " + s.getImages().size());
                for (SignalementImage img : s.getImages()) {
                    System.out.println("SignalementDto.fromEntity - Processing image: " + img.getNomFichier());
                    SignalementImageDTO imgDto = new SignalementImageDTO();
                    imgDto.setCheminLocal(img.getCheminLocal());
                    imgDto.setCheminOnline(img.getCheminOnline());
                    imgDto.setNomFichier(img.getNomFichier());
                    imageDtos.add(imgDto);
                }
                System.out.println("SignalementDto.fromEntity - Total images mapped: " + imageDtos.size());
            } else {
                System.out.println("SignalementDto.fromEntity - Images collection is NULL (lazy loading failed?)");
            }
        } catch (Exception e) {
            // Lazy loading may fail if session is closed
            System.err.println("SignalementDto.fromEntity - ERROR loading images for signalement " + s.getId() + ": " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
        }
        dto.setImages(imageDtos);
        System.out.println("SignalementDto.fromEntity - Final DTO has " + (dto.getImages() != null ? dto.getImages().size() : 0) + " images");
        return dto;
    }
    


    public String toString () {
        return "SignalementDto{id=" + id +
                ", userId=" + userId +
                ", userToken='" + userToken + '\'' +
                ", x=" + x +
                ", y=" + y +
                ", localisation='" + localisation + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                ", statusLibelle='" + statusLibelle + '\'' +
                ", valeur=" + valeur +
                '}';
    }
}