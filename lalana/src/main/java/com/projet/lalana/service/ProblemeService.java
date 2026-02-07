package com.projet.lalana.service;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.repository.ProblemeRepository;
import com.projet.lalana.repository.ProblemeStatusRepository;
import com.projet.lalana.repository.ProblemeHistoryRepository;
import com.projet.lalana.model.ProblemeHistory;
import com.projet.lalana.model.ProblemeStatus;
import com.projet.lalana.dto.ManagerStatsDto;
import com.projet.lalana.dto.ManagerStatsDto.ProblemeSampleDto;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.springframework.transaction.annotation.Transactional;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemeService {

    private static final Logger logger = LoggerFactory.getLogger(ProblemeService.class);
    private final Integer CREATE_STATUS_VALUE = 10;
    private final Integer PROCESSING_STATUS_VALUE = 20;
    private final Integer RESOLVED_STATUS_VALUE = 30;

    private final ProblemeRepository problemeRepository;
    private final ProblemeStatusRepository problemeStatusRepository;
    private final ProblemeHistoryRepository problemeHistoryRepository;

    public List<Probleme> getAll() {
        try {
            return problemeRepository.findAll();
        } catch (Exception e) {
            logger.error("Erreur lors de getAll problemes", e);
            throw new ServiceException("Erreur lors de la récupération des problèmes", e);
        }
    }

    public Optional<Probleme> getById(Integer id) {
        try {
            return problemeRepository.findById(id);
        } catch (Exception e) {
            logger.error("Erreur lors de getById probleme id={}", id, e);
            throw new ServiceException("Erreur lors de la récupération du problème id=" + id, e);
        }
    }

    @Transactional
    public Probleme processer(Integer id) {
        try {
            Probleme probleme = problemeRepository.findById(id)
                    .orElseThrow(() -> new ServiceException("Problème non trouvé id=" + id));

            ProblemeStatus processingStatus = problemeStatusRepository.findByValeur(PROCESSING_STATUS_VALUE)
                    .orElseThrow(() -> new ServiceException(
                            "[DEBUG] Status en cours introuvable (VALEUR=" + PROCESSING_STATUS_VALUE + ")"));

            probleme.setProblemeStatus(processingStatus);
            Probleme saved = problemeRepository.save(probleme);

            ProblemeHistory history = new ProblemeHistory();
            history.setProbleme(saved);
            history.setStatus(processingStatus);
            history.setChangedAt(LocalDateTime.now());
            problemeHistoryRepository.save(history);

            return saved;
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors du traitement du problème id={}", id, e);
            throw new ServiceException("Erreur lors du traitement du problème id=" + id, e);
        }
    }

    @Transactional
    public Probleme resoudre(Integer id) {
        try {
            Probleme probleme = problemeRepository.findById(id)
                    .orElseThrow(() -> new ServiceException("Problème non trouvé id=" + id));
            
            ProblemeStatus resolvedStatus = problemeStatusRepository.findByValeur(RESOLVED_STATUS_VALUE)
                    .orElseThrow(() -> new ServiceException(
                            "[DEBUG] Status résolu introuvable (VALEUR=" + RESOLVED_STATUS_VALUE + ")"));

            probleme.setProblemeStatus(resolvedStatus);
            Probleme saved = problemeRepository.save(probleme);

            ProblemeHistory history = new ProblemeHistory();
            history.setProbleme(saved);
            history.setStatus(resolvedStatus);
            history.setChangedAt(LocalDateTime.now());
            problemeHistoryRepository.save(history);

            return saved;
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors de la résolution du problème id={}", id, e);
            throw new ServiceException("Erreur lors de la résolution du problème id=" + id, e);
        }
    }

    public List<Probleme> findByValeur(Integer valeur) {
        try {
            return problemeRepository.findByValeur(valeur);
        } catch (Exception e) {
            logger.error("Erreur lors de findByValeur valeur={}", valeur, e);
            throw new ServiceException("Erreur lors de la récupération des problèmes par valeur", e);
        }
    }


    public ManagerStatsDto getManagerStats() {
        try {
            List<Probleme> allProblemes = problemeRepository.findAll();

            long nouveauCount = allProblemes.stream()
                    .filter(p -> p.getProblemeStatus() != null && p.getProblemeStatus().getValeur() == 10)
                    .count();
            long enCoursCount = allProblemes.stream()
                    .filter(p -> p.getProblemeStatus() != null && p.getProblemeStatus().getValeur() == 20)
                    .count();
            long termineCount = allProblemes.stream()
                    .filter(p -> p.getProblemeStatus() != null && p.getProblemeStatus().getValeur() == 30)
                    .count();
            
            Map<String, Integer> counts = new HashMap<>();
            counts.put("nouveau", (int) nouveauCount);
            counts.put("enCours", (int) enCoursCount);
            counts.put("termine", (int) termineCount);
            counts.put("total", allProblemes.size());
            
            
            List<Double> nouveauToEnCoursDurations = new ArrayList<>();
            List<Double> enCoursToTermineDurations = new ArrayList<>();
            List<Double> totalDurations = new ArrayList<>();
            
            for (Probleme p : allProblemes) {
                List<ProblemeHistory> history = problemeHistoryRepository.findByProblemeIdOrderByChangedAtAsc(p.getId());
                
                LocalDateTime nouveauDate = history.stream()
                        .filter(h -> h.getStatus().getValeur() == 10)
                        .map(ProblemeHistory::getChangedAt)
                        .findFirst()
                        .orElse(null);
                
                LocalDateTime enCoursDate = history.stream()
                        .filter(h -> h.getStatus().getValeur() == 20)
                        .map(ProblemeHistory::getChangedAt)
                        .findFirst()
                        .orElse(null);
                
                LocalDateTime termineDate = history.stream()
                        .filter(h -> h.getStatus().getValeur() == 30)
                        .map(ProblemeHistory::getChangedAt)
                        .findFirst()
                        .orElse(null);
                
                
                if (nouveauDate != null && enCoursDate != null) {
                    double days = ChronoUnit.DAYS.between(nouveauDate, enCoursDate);
                    nouveauToEnCoursDurations.add(days);
                }
                
                if (enCoursDate != null && termineDate != null) {
                    double days = ChronoUnit.DAYS.between(enCoursDate, termineDate);
                    enCoursToTermineDurations.add(days);
                }
                
                if (nouveauDate != null && termineDate != null) {
                    double days = ChronoUnit.DAYS.between(nouveauDate, termineDate);
                    totalDurations.add(days);
                }
            }
            
            Map<String, Double> averages = new HashMap<>();
            averages.put("nouveauToEnCours", 
                    nouveauToEnCoursDurations.isEmpty() ? 0.0 
                    : nouveauToEnCoursDurations.stream().mapToDouble(d -> d).average().orElse(0.0));
            averages.put("enCoursToTermine", 
                    enCoursToTermineDurations.isEmpty() ? 0.0 
                    : enCoursToTermineDurations.stream().mapToDouble(d -> d).average().orElse(0.0));
            averages.put("totalNouveauToTermine", 
                    totalDurations.isEmpty() ? 0.0 
                    : totalDurations.stream().mapToDouble(d -> d).average().orElse(0.0));
            
            
            Map<String, Integer> minMax = new HashMap<>();
            if (!totalDurations.isEmpty()) {
                minMax.put("min", totalDurations.stream().min(Double::compareTo).orElse(0.0).intValue());
                minMax.put("max", totalDurations.stream().max(Double::compareTo).orElse(0.0).intValue());
            } else {
                minMax.put("min", 0);
                minMax.put("max", 0);
            }
            
            
            List<Map<String, Object>> histogram = new ArrayList<>();
            
            
            List<ProblemeSampleDto> samples = allProblemes.stream().map(p -> {
                List<ProblemeHistory> history = problemeHistoryRepository.findByProblemeIdOrderByChangedAtAsc(p.getId());
                
                LocalDateTime nouveauDate = history.stream()
                        .filter(h -> h.getStatus().getValeur() == 10)
                        .map(ProblemeHistory::getChangedAt)
                        .findFirst()
                        .orElse(null);
                
                LocalDateTime enCoursDate = history.stream()
                        .filter(h -> h.getStatus().getValeur() == 20)
                        .map(ProblemeHistory::getChangedAt)
                        .findFirst()
                        .orElse(null);
                
                LocalDateTime termineDate = history.stream()
                        .filter(h -> h.getStatus().getValeur() == 30)
                        .map(ProblemeHistory::getChangedAt)
                        .findFirst()
                        .orElse(null);
                
                String localisation = (p.getSignalement() != null && p.getSignalement().getPoint() != null) 
                        ? p.getSignalement().getPoint().getLocalisation() 
                        : "Localisation inconnue";
                
                String entrepriseName = (p.getEntreprise() != null) ? p.getEntreprise().getNom() : null;
                
                Integer statusValeur = (p.getProblemeStatus() != null) ? p.getProblemeStatus().getValeur() : 0;
                
                return new ProblemeSampleDto(
                        p.getId(),
                        entrepriseName,
                        statusValeur,
                        localisation,
                        nouveauDate,
                        enCoursDate,
                        termineDate
                );
            }).collect(Collectors.toList());
            
            return new ManagerStatsDto(counts, averages, minMax, histogram, samples);
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul des statistiques manager", e);
            throw new ServiceException("Erreur lors du calcul des statistiques", e);
        }
    }

}
