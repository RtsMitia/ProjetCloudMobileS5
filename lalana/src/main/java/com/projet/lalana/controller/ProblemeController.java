package com.projet.lalana.controller;

import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.ProblemeService;
import com.projet.lalana.service.ServiceException;
import com.projet.lalana.dto.ProblemeDto;
import com.projet.lalana.model.Probleme;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/problemes")
@RequiredArgsConstructor
public class ProblemeController {

    private static final Logger logger = LoggerFactory.getLogger(ProblemeController.class);

    private final ProblemeService problemeService;

    @GetMapping
    public ApiResponse getAll() {
        try {
            List<Probleme> list = problemeService.getAll();
            return new ApiResponse(true, "Problèmes récupérés", list);
        } catch (ServiceException se) {
            logger.error("ServiceException getAll problemes", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getAll problemes", e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération des problèmes", null);
        }
    }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Integer id) {
        try {
            return problemeService.getById(id)
                    .map(p -> new ApiResponse(true, "Problème trouvé", p))
                    .orElseGet(() -> new ApiResponse(false, "Problème non trouvé", null));
        } catch (ServiceException se) {
            logger.error("ServiceException getById probleme id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getById probleme id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération du problème", null);
        }
    }

    @PostMapping("/{id}/resoudre")
    public ApiResponse resoudre(@PathVariable Integer id) {
        try {
            Probleme updated = problemeService.resoudre(id);
            return new ApiResponse(true, "Problème résolu", updated);
        } catch (ServiceException se) {
            logger.error("ServiceException resoudre probleme id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error resoudre probleme id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors de la résolution du problème", null);
        }
    }

    
    @GetMapping("/valeur/10")
    public ApiResponse getProblemesValeur10() {
        try {
            List<Probleme> list = problemeService.findByValeur(10);
            List<ProblemeDto> out = list.stream().map(ProblemeDto::fromEntity).toList();
            return new ApiResponse(true, "OK", out);
        } catch (Exception e) {
            logger.error("Erreur getProblemesValeur10", e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération des problèmes", null);
        }
    }

    @PostMapping("/{id}/resolve")
    public ApiResponse resolveProbleme(@PathVariable Integer id) {
        try {
            Probleme updated = problemeService.markResolved(id);
            return new ApiResponse(true, "Problème marqué comme résolu", ProblemeDto.fromEntity(updated));
        } catch (ServiceException se) {
            logger.error("ServiceException resolveProbleme id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error resolveProbleme id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors du changement de statut du problème", null);
        }
    }
}
