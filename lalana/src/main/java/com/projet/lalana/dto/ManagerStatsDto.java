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

    private Map<String, Integer> counts;
    private Map<String, Double> averages;
    private Map<String, Integer> minMax;
    private List<Map<String, Object>> histogram;
    private List<ProblemeSampleDto> samples;


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
