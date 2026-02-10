package com.projet.lalana.controller;

import com.projet.lalana.model.Config;
import com.projet.lalana.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {
    
    private final ConfigService configService;
    
    // GET: Récupérer une config par clé
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, Object>> getConfigByKey(@PathVariable String key) {
        try {
            Optional<Config> config = configService.findByKey(key);
            
            if (config.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Configuration récupérée avec succès");
                response.put("data", config.get());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Configuration non trouvée pour la clé: " + key);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération de la configuration: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
