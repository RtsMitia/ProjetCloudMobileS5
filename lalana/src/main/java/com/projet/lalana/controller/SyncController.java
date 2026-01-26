package com.projet.lalana.controller;

import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sync")
@RequiredArgsConstructor
public class SyncController {

    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);
    private final SyncService syncService;

    @PostMapping
    public ApiResponse runSync() {
        try {
            var out = syncService.syncAll();
            return new ApiResponse(true, "Sync completed", out);
        } catch (Exception e) {
            logger.error("Error during sync", e);
            return new ApiResponse(false, "Sync failed: " + e.getMessage(), null);
        }
    }
}
