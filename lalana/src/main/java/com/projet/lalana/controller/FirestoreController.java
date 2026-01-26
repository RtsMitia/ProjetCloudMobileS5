package com.projet.lalana.controller;

import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.FirestoreService;
import com.projet.lalana.service.ServiceException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/firestore")
@RequiredArgsConstructor
public class FirestoreController {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreController.class);

    private final FirestoreService firestoreService;

    @GetMapping("/signalements")
    public ApiResponse getAllSignalements() {
        try {
            return new ApiResponse(true, "Données Firestore récupérées", signalementService.getAllSignalementsFromFirestore());
        } catch (ServiceException se) {
            logger.error("ServiceException getAllSignalements", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getAllSignalements", e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération des données Firestore", null);
        }
    }
}
