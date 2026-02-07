package com.projet.lalana.controller;

import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.ServiceException;
import com.projet.lalana.service.SignalementService;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.Probleme;
import com.projet.lalana.dto.RapportTech;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/signalements")
@RequiredArgsConstructor
public class SignalementController {

    private static final Logger logger = LoggerFactory.getLogger(SignalementController.class);

    private final SignalementService signalementService;

    @GetMapping
    public ApiResponse getAll() {
        try {
            List<Signalement> list = signalementService.getAll();
            return new ApiResponse(true, "Signalements récupérés", list);
        } catch (ServiceException se) {
            logger.error("ServiceException getAll", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getAll", e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération des signalements", null);
        }
    }

    @GetMapping("/nonresolus")
    public ApiResponse getNonResolus() {
        try {
            List<Signalement> list = signalementService.getSignalementsNonResolus();
            return new ApiResponse(true, "Signalements non résolus récupérés", list);
        } catch (ServiceException se) {
            logger.error("ServiceException getNonResolus", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getNonResolus", e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération des signalements non résolus", null);
        }
    }

    @GetMapping("/{id:\\d+}")
    public ApiResponse getById(@PathVariable Integer id) {
        try {
            return signalementService.getById(id)
                    .map(s -> new ApiResponse(true, "Signalement trouvé", s))
                    .orElseGet(() -> new ApiResponse(false, "Signalement non trouvé", null));
        } catch (ServiceException se) {
            logger.error("ServiceException getById id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getById id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération du signalement", null);
        }
    }

    @GetMapping("/sync")
    public ApiResponse synchronise() {
        try {
            int imported = signalementService.synchronisation();
            return new ApiResponse(true, "Synchronisation terminée", imported);
        } catch (ServiceException se) {
            logger.error("ServiceException synchronisation", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error synchronisation", e);
            return new ApiResponse(false, "Erreur serveur lors de la synchronisation", null);
        }
    }

    @PostMapping("/{id}/sendtech")
    public ApiResponse sendTechnicien(@PathVariable Integer id){
        try {
            Signalement signalement = signalementService.envoyerTechnicien(id);
            return new ApiResponse(true, "Signalements envoyés aux techniciens", signalement);
        } catch (ServiceException se) {
            logger.error("ServiceException sendTechnicien", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error sendTechnicien", e);
            return new ApiResponse(false, "Erreur serveur lors de l'envoi des signalements aux techniciens", null);
        }
    }

    @PostMapping("/rapportTech") 
    public ApiResponse rapportTechnicien(@RequestBody RapportTech rapportTech){
        try {
            Probleme probleme = signalementService.rapportTechnicien(rapportTech);
            return new ApiResponse(true, "Rapport technicien enregistré", probleme);
        } catch (ServiceException se) {
            logger.error("ServiceException rapportTechnicien", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error rapportTechnicien", e);
            return new ApiResponse(false, "Erreur serveur lors de l'enregistrement du rapport technicien", null);
        }
    }

}
