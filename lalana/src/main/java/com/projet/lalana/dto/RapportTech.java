package com.projet.lalana.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RapportTech {
    private Integer signalementId;
    private Double surface;
    private Double budgetEstime;
    private Integer entrepriseId;
}
