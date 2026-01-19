package com.projet.lalana.controller;

import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.ServiceException;
import com.projet.lalana.service.SignalementService;
import com.projet.lalana.model.Signalement;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/{id}")
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
}
