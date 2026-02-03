package com.projet.lalana.dto;

import com.projet.lalana.model.Point;
import com.projet.lalana.model.Signalement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    public static SignalementDto fromEntity(Signalement s) {
        if (s == null) return null;
        SignalementDto.SignalementDtoBuilder b = SignalementDto.builder()
                .id(s.getId())
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

        return b.build();
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