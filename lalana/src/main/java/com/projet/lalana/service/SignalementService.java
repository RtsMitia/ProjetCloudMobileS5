
package com.projet.lalana.service;

import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.SignalementHistory;
import com.projet.lalana.model.SignalementStatus;
import com.projet.lalana.repository.SignalementHistoryRepository;
import com.projet.lalana.repository.SignalementRepository;
import com.projet.lalana.repository.SignalementStatusRepository;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.GeoPoint;
import com.projet.lalana.dto.SignalementDto;
import com.projet.lalana.model.Point;
import com.projet.lalana.repository.PointRepository;
import com.projet.lalana.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SignalementService {

    private static final Logger logger = LoggerFactory.getLogger(SignalementService.class);

    private final SignalementRepository signalementRepository;
    private final SignalementHistoryRepository signalementHistoryRepository;
    private final SignalementStatusRepository statusSignalementRepository;
    private final FirestoreService firestoreService;
    private final PointRepository pointRepository;
    private final UserRepository userRepository;

    public List<Signalement> getAll() {
        try {
            return signalementRepository.findAll();
        } catch (Exception e) {
            logger.error("Erreur lors de getAll signalements", e);
            throw new ServiceException("Erreur lors de la récupération des signalements", e);
        }
    }

    public Optional<Signalement> getById(Integer id) {
        try {
            return signalementRepository.findById(id);
        } catch (Exception e) {
            logger.error("Erreur lors de getById signalement id={}", id, e);
            throw new ServiceException("Erreur lors de la récupération du signalement id=" + id, e);
        }
    }

    public Signalement envoyerTechnicien(Integer signalementId) {
        Signalement signalement = getById(signalementId)
                .orElseThrow(() -> new ServiceException("Signalement non trouvé pour l'ID: " + signalementId));

        SignalementHistory signalementHistory = new SignalementHistory();
        SignalementStatus status = statusSignalementRepository.findById(2)
                .orElseThrow(() -> new ServiceException("Statut 'En attente de technicien' non trouvé"));
        signalementHistory.setSignalement(signalement);
        signalementHistory.setStatus(status);

        signalementHistory.setChangedAt(java.time.LocalDateTime.now());
        signalementHistoryRepository.save(signalementHistory);
        logger.info("Technicien envoyé pour le signalement id={}", signalementId);
        signalement.setStatus(status);
        signalementRepository.save(signalement);
        return signalement;
    }

    /**
     * Fetch raw documents from Firestore (via FirestoreService) and map them to SignalementDto.
     */
    public List<SignalementDto> getAllSignalementsFromFirestore() {
        List<SignalementDto> result = new java.util.ArrayList<>();
        try {
            List<DocumentSnapshot> docs = firestoreService.fetchAllSignalementDocuments();
            for (DocumentSnapshot doc : docs) {
                try {
                    SignalementDto dto = mapDocToDto(doc);
                    if (dto != null) result.add(dto);
                } catch (Exception ex) {
                    logger.warn("Impossible de mapper doc {}: {}", doc.getId(), ex.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Erreur mapping Firestore -> SignalementDto", e);
            throw new ServiceException("Erreur lors de la récupération des données Firestore", e);
        }
        return result;
    }

    private SignalementDto mapDocToDto(DocumentSnapshot doc) {
        if (doc == null || !doc.exists()) return null;
        
        SignalementDto.SignalementDtoBuilder b = SignalementDto.builder();

        String docId = doc.getId();
        try {
            b.id(Integer.parseInt(docId));
        } catch (Exception ignored) { }

        b.description(asString(doc.get("description")));

        String statut = asString(doc.get("statut"));
        if (statut == null) statut = asString(doc.get("status"));
        b.statusLibelle(statut);

        Timestamp ts = doc.getTimestamp("dateSignalement");
        if (ts == null) ts = doc.getTimestamp("createdAt");
        if (ts != null) {
            b.createdAt(ts.toDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }

        Double x = asDouble(doc.get("x"));
        if (x == null) x = asDouble(doc.get("lat"));
        Double y = asDouble(doc.get("y"));
        if (y == null) y = asDouble(doc.get("lon"));
        b.x(x).y(y);

        String localisation = asString(doc.get("localisation"));
        if (localisation == null) localisation = asString(doc.get("location"));
        b.localisation(localisation);

        if (doc.get("userId") != null) {
            Double uid = asDouble(doc.get("userId"));
            if (uid != null) b.userId(uid.intValue());
        }

        return b.build();
    }

    private String asString(Object o) {
        if (o == null) return null;
        if (o instanceof String) return (String) o;
        // Si c'est un objet/map, ignorer ou convertir en JSON
        if (o instanceof java.util.Map) {
            logger.debug("Champ est un Map, ignoré: {}", o);
            return null;
        }
        return o.toString();
    }

    private Double asDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return Double.parseDouble(o.toString()); } catch (Exception ex) { return null; }
    }

    /**
     * Synchronise les signalements depuis Firestore vers la base locale.
     * Méthode idempotente : les documents déjà importés (même firestore doc id) sont ignorés.
     * Retourne le nombre de nouveaux enregistrements importés.
     */
    public int synchronisation() {
        int imported = 0;
        try {
            // Use the DTO list as source of truth for import (no change to DTO class)
            List<SignalementDto> dtos = getAllSignalementsFromFirestore();
            for (SignalementDto dto : dtos) {
                try {
                    // Build Signalement from DTO
                    com.projet.lalana.model.Signalement s = new com.projet.lalana.model.Signalement();
                    s.setDescription(dto.getDescription());

                    // Coordinates
                    Double x = dto.getX();
                    Double y = dto.getY();
                    Point p = new Point();
                    p.setX(x != null ? x : 0.0);
                    p.setY(y != null ? y : 0.0);
                    p.setLocalisation(dto.getLocalisation() != null ? dto.getLocalisation() : "");
                    pointRepository.save(p);
                    s.setPoint(p);

                    // user
                    if (dto.getUserId() != null) {
                        userRepository.findById(dto.getUserId()).ifPresent(s::setUser);
                    }

                    // createdAt
                    if (dto.getCreatedAt() != null) {
                        s.setCreatedAt(dto.getCreatedAt());
                    } else {
                        s.setCreatedAt(java.time.LocalDateTime.now());
                    }

                    // default status
                    statusSignalementRepository.findById(1).ifPresent(s::setStatus);

                    com.projet.lalana.model.Signalement saved = signalementRepository.save(s);

                    // add initial history entry
                    if (saved.getStatus() != null) {
                        SignalementHistory h = new SignalementHistory();
                        h.setSignalement(saved);
                        h.setStatus(saved.getStatus());
                        h.setChangedAt(saved.getCreatedAt() != null ? saved.getCreatedAt() : java.time.LocalDateTime.now());
                        signalementHistoryRepository.save(h);
                    }

                    imported++;
                } catch (Exception inner) {
                    logger.error("Erreur import DTO (description={}): {}", dto.getDescription(), inner.getMessage(), inner);
                }
            }

            // After importing all DTOs, delete all documents in the Firestore collection to clean up
            try {
                List<DocumentSnapshot> docs = firestoreService.fetchAllSignalementDocuments();
                for (DocumentSnapshot doc : docs) {
                    try {
                        firestoreService.deleteDocument("signalements_problemes", doc.getId());
                    } catch (Exception exDel) {
                        logger.warn("Impossible de supprimer doc Firestore {}: {}", doc.getId(), exDel.getMessage());
                    }
                }
            } catch (Exception eDelAll) {
                logger.error("Erreur lors de la suppression en masse des documents Firestore: {}", eDelAll.getMessage(), eDelAll);
            }
        } catch (Exception e) {
            logger.error("Erreur synchronization Firestore", e);
            throw new ServiceException("Erreur lors de la synchronisation depuis Firestore", e);
        }

        return imported;
    }
    
}
