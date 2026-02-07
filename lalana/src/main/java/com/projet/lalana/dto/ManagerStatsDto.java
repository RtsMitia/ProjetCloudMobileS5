package com.projet.lalana.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerStatsDto {

    private Map<String, Integer> counts;        // { nouveau: 2, enCours: 4, termine: 4, total: 10 }
    private Map<String, Double> averages;       // { nouveauToEnCours: 2.0, enCoursToTermine: 6.5, totalNouveauToTermine: 8.5 }
    private Map<String, Integer> minMax;        // { min: 1, max: 18 }
    private List<Map<String, Object>> histogram; // Optional: histogram data (can be empty for now)
    private List<ProblemeSampleDto> samples;    // Sample problems with status history dates

    /**
     * DTO simplifié pour un échantillon de problème avec dates de status
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemeSampleDto {
        private Integer id;
        private String entrepriseName;
        private Integer statusValeur;
        private String localisation;
        private LocalDateTime dateNouveauStatus;
        private LocalDateTime dateEnCoursStatus;
        private LocalDateTime dateTermineStatus;
    }
}
