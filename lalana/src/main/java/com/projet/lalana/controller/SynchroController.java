package com.projet.lalana.controller;

import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.SynchroService;
import com.projet.lalana.service.SynchroService.SyncResult;
import com.projet.lalana.service.UserService;
import com.projet.lalana.model.User;
import com.projet.lalana.service.ServiceException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SynchroController {

    private static final Logger logger = LoggerFactory.getLogger(SynchroController.class);

    private final SynchroService synchroService;
    private final UserService userService;

    @GetMapping("/full")
    public ApiResponse fullSync() {
        try {
            SyncResult res = synchroService.fullSync();
            return new ApiResponse(true, "Full sync completed", res);
        } catch (ServiceException se) {
            logger.error("ServiceException during full sync", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error during full sync", e);
            return new ApiResponse(false, "Erreur serveur lors de la synchronisation", null);
        }
    }

}
