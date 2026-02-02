package com.projet.lalana.controller;

import com.projet.lalana.model.Entreprise;
import com.projet.lalana.service.EntrepriseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseController {
    
    @Autowired
    private EntrepriseService entrepriseService;
    
    // GET: Récupérer toutes les entreprises
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEntreprises() {
        try {
            List<Entreprise> entreprises = entrepriseService.getAllEntreprises();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Entreprises récupérées avec succès");
            response.put("data", entreprises);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des entreprises: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // GET: Récupérer une entreprise par ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEntrepriseById(@PathVariable Integer id) {
        try {
            Optional<Entreprise> entreprise = entrepriseService.getEntrepriseById(id);
            
            if (entreprise.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Entreprise récupérée avec succès");
                response.put("data", entreprise.get());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Entreprise non trouvée avec l'ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération de l'entreprise: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // POST: Créer une nouvelle entreprise
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEntreprise(@RequestBody Entreprise entreprise) {
        try {
            // Validation des données
            if (entreprise.getNom() == null || entreprise.getNom().trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Le nom de l'entreprise est obligatoire");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Vérifier si une entreprise avec le même nom existe déjà
            if (entrepriseService.existsByNom(entreprise.getNom())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Une entreprise avec le nom '" + entreprise.getNom() + "' existe déjà");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            }
            
            // Sauvegarder l'entreprise
            Entreprise savedEntreprise = entrepriseService.createEntreprise(entreprise);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Entreprise créée avec succès");
            response.put("data", savedEntreprise);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la création de l'entreprise: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // GET: Rechercher des entreprises par nom (optionnel)
    @GetMapping("/rechercher")
    public ResponseEntity<Map<String, Object>> searchEntreprises(@RequestParam(required = false) String nom) {
        try {
            List<Entreprise> entreprises;
            
            if (nom != null && !nom.trim().isEmpty()) {
                // Recherche par nom (à implémenter dans le repository si besoin)
                entreprises = entrepriseService.getAllEntreprises().stream()
                    .filter(e -> e.getNom().toLowerCase().contains(nom.toLowerCase()))
                    .toList();
            } else {
                entreprises = entrepriseService.getAllEntreprises();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Entreprises trouvées");
            response.put("data", entreprises);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la recherche: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}