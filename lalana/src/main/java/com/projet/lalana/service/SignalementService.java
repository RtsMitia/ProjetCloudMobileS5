
package com.projet.lalana.service;

import com.projet.lalana.model.Entreprise;
import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.ProblemeHistory;
import com.projet.lalana.model.ProblemeStatus;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.SignalementHistory;
import com.projet.lalana.model.SignalementStatus;
import com.projet.lalana.model.User;
import com.projet.lalana.repository.EntrepriseRepository;
import com.projet.lalana.repository.SignalementHistoryRepository;
import com.projet.lalana.repository.SignalementRepository;
import com.projet.lalana.repository.SignalementStatusRepository;
import com.projet.lalana.repository.ProblemeHistoryRepository;
import com.projet.lalana.repository.ProblemeRepository;
import com.projet.lalana.repository.ProblemeStatusRepository;

import com.projet.lalana.dto.RapportTech;
import com.projet.lalana.dto.SignalementImageDTO;
import com.projet.lalana.model.SignalementImage;
import com.projet.lalana.repository.SignalementImageRepository;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.GeoPoint;
import com.projet.lalana.dto.SignalementDto;
import com.projet.lalana.model.Point;
import com.projet.lalana.repository.PointRepository;
import com.projet.lalana.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import javax.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.io.InputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import sun.misc.Signal;

@Service
@RequiredArgsConstructor
public class SignalementService {
    private final Integer CREATE_STATUS_VALUE = 10;
    private final Integer PROCESSING_STATUS_VALUE = 20;
    private final Integer RESOLVED_STATUS_VALUE = 30;


    private static final Logger logger = LoggerFactory.getLogger(SignalementService.class);

    private final SignalementRepository signalementRepository;
    private final SignalementHistoryRepository signalementHistoryRepository;
    private final SignalementStatusRepository statusSignalementRepository;
    private final FirestoreService firestoreService;
    private final PointRepository pointRepository;
    private final UserRepository userRepository;
    private final SignalementImageRepository signalementImageRepository;
    private final ProblemeRepository problemeRepository;
    private final ProblemeHistoryRepository problemeHistoryRepository;
    private final ProblemeStatusRepository problemeStatusRepository;
    private final EntrepriseRepository entrepriseRepository;

    @Value("${uploads.base-dir:uploads}")
    private String uploadsBaseDir;

    @PostConstruct
    public void initUploadsBaseDir() {
        try {
            Path p = Paths.get(uploadsBaseDir).toAbsolutePath();
            System.out.println("INFO: uploads.base-dir configured = " + uploadsBaseDir + " -> " + p);
        } catch (Exception e) {
            System.out.println("WARN: Impossible de résoudre uploads.base-dir '" + uploadsBaseDir + "': " + e.getMessage());
        }
    }

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
        
        logger.info("Technicien envoyé pour le signalement id={}", signalementId);
        signalement.setStatus(status);
        signalement.setFirestoreSynced(false);
        
        signalementHistoryRepository.save(signalementHistory);
        signalementRepository.save(signalement);
        return signalement;
    }

    /**
     * Fetch raw documents from Firestore (via FirestoreService) and map them to
     * SignalementDto.
     */
    public List<SignalementDto> getAllSignalementsFromFirestore() {
        List<SignalementDto> result = new java.util.ArrayList<>();
        try {
            List<DocumentSnapshot> docs = firestoreService.fetchAllSignalementDocuments();
            for (DocumentSnapshot doc : docs) {
                try {
                    SignalementDto dto = mapDocToDto(doc);
                    if (dto != null)
                        result.add(dto);
                } catch (Exception ex) {
                    System.out.println("WARN: Impossible de mapper doc " + doc.getId() + ": " + ex.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Erreur mapping Firestore -> SignalementDto", e);
            throw new ServiceException("Erreur lors de la récupération des données Firestore", e);
        }
        return result;
    }

    private SignalementDto mapDocToDto(DocumentSnapshot doc) {
        if (doc == null || !doc.exists())
            return null;

        SignalementDto.SignalementDtoBuilder b = SignalementDto.builder();
        // description
        b.description(asString(doc.get("description")));
        // createdAt: handle multiple possible Firestore representations (Timestamp, String, Number)
        Object createdObj = doc.get("createdAt");
        LocalDateTime createdAt = LocalDateTime.now();
        if (createdObj != null) {
            try {
                if (createdObj instanceof Timestamp) {
                    Timestamp ts = (Timestamp) createdObj;
                    createdAt = ts.toDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                } else if (createdObj instanceof String) {
                    String s = (String) createdObj;
                    try {
                        createdAt = LocalDateTime.parse(s);
                    } catch (Exception e1) {
                        try {
                            Instant inst = Instant.parse(s);
                            createdAt = LocalDateTime.ofInstant(inst, java.time.ZoneId.systemDefault());
                        } catch (Exception e2) {
                            System.out.println("WARN: Impossible de parser createdAt string pour doc " + doc.getId() + ": " + s);
                        }
                    }
                } else if (createdObj instanceof Number) {
                    long v = ((Number) createdObj).longValue();
                    Instant inst = v > 1000000000000L ? Instant.ofEpochMilli(v) : Instant.ofEpochSecond(v);
                    createdAt = LocalDateTime.ofInstant(inst, java.time.ZoneId.systemDefault());
                } else {
                    System.out.println("WARN: createdAt type non géré pour doc " + doc.getId() + ": " + createdObj.getClass().getName());
                }
            } catch (Exception e) {
                System.out.println("WARN: Erreur lors du parsing de createdAt pour doc " + doc.getId() + ": " + e.getMessage());
            }
        }
        b.createdAt(createdAt);

        // value de status cree
        b.valeur(10);
        // coordinates
        Double x = asDouble(doc.get("x"));
        if (x == null)
            x = asDouble(doc.get("lat"));
        if (x == null) 
            x = 0.0;
        Double y = asDouble(doc.get("y"));
        if (y == null)
            y = asDouble(doc.get("lon"));
        if (y == null)
            y = 0.0;
        b.x(x).y(y);

        // localisation
        String localisation = asString(doc.get("localisation"));
        if (localisation == null)
            localisation = asString(doc.get("localisation"));
        b.localisation(localisation);
        // user
        if (doc.get("userToken") != null) {
            b.userToken(asString(doc.get("userToken")));
        } else if (doc.get("userId") != null) {
            // Firestore may store Firebase UID in userId (string). Use it as userToken
            String uid = asString(doc.get("userId"));
            if (uid != null) b.userToken(uid);
        }

        // statusLibelle if provided
        if (doc.get("statusLibelle") != null) {
            b.statusLibelle(asString(doc.get("statusLibelle")));
        }

        SignalementDto dto = b.build();
        try {
            List<SignalementImageDTO> imageDtos = new ArrayList<>();
            Object photoUrlsObj = doc.get("photoUrls");
            if (photoUrlsObj instanceof List) {
                List urls = (List) photoUrlsObj;
                for (Object u : urls) {
                    String online = asString(u);
                    if (online != null) {
                        String fileName = null;
                        try {
                            String path = new java.net.URL(online).getPath();
                            fileName = Paths.get(path).getFileName().toString();
                        } catch (Exception e) {
                        }
                        SignalementImageDTO imgDto = new SignalementImageDTO();
                        imgDto.setCheminOnline(online);
                        imgDto.setNomFichier(fileName);
                        imgDto.setCheminLocal(null);
                        imageDtos.add(imgDto);
                    }
                }
            } 
            // else {
            //     // fallback to legacy 'images' field
            //     Object imagesObj = doc.get("images");
            //     if (imagesObj instanceof java.util.List) {
            //         java.util.List imgs = (java.util.List) imagesObj;
            //         for (Object o : imgs) {
            //             if (o instanceof java.util.Map) {
            //                 java.util.Map map = (java.util.Map) o;
            //                 String online = asString(map.get("online_path"));
            //                 String fileName = asString(map.get("file_name"));
            //                 SignalementImageDTO imgDto = new SignalementImageDTO();
            //                 imgDto.setCheminOnline(online);
            //                 imgDto.setNomFichier(fileName);
            //                 imgDto.setCheminLocal(null);
            //                 imageDtos.add(imgDto);
            //             } else if (o instanceof String) {
            //                 String online = asString(o);
            //                 String fileName = null;
            //                 try {
            //                     String path = new java.net.URL(online).getPath();
            //                     fileName = Paths.get(path).getFileName().toString();
            //                 } catch (Exception e) {}
            //                 SignalementImageDTO imgDto = new SignalementImageDTO();
            //                 imgDto.setCheminOnline(online);
            //                 imgDto.setNomFichier(fileName);
            //                 imgDto.setCheminLocal(null);
            //                 imageDtos.add(imgDto);
            //             }
            //         }
            //     }
            // }

            if (!imageDtos.isEmpty()) dto.setImages(imageDtos);
        } catch (Exception exImg) {
            System.out.println("WARN: Impossible d'extraire les images du document Firestore " + doc.getId() + ": " + exImg.getMessage());
        }

        return dto;
    }

    private String asString(Object o) {
        if (o == null)
            return null;
        if (o instanceof String)
            return (String) o;
        // Si c'est un objet/map, ignorer ou convertir en JSON
        if (o instanceof java.util.Map) {
            logger.debug("Champ est un Map, ignoré: {}", o);
            return null;
        }
        return o.toString();
    }

    private Double asDouble(Object o) {
        if (o == null)
            return null;
        if (o instanceof Number)
            return ((Number) o).doubleValue();
        try {
            return Double.parseDouble(o.toString());
        } catch (Exception ex) {
            return null;
        }
    }

    public int synchronisation() {
        int imported = 0;
        LocalDateTime now = LocalDateTime.now();
        try {
            // Use the DTO list as source of truth for import (no change to DTO class)
            List<SignalementDto> dtos = getAllSignalementsFromFirestore();
            SignalementStatus status = statusSignalementRepository.findByValeur(10)
                    .orElseThrow(() -> new ServiceException("Statut initial du signalement non trouvé"));
                for (SignalementDto dto : dtos) {

                try {
                    // Build Signalement from DTO
                    Signalement s = new Signalement();
                    // getUser
                    User user = null;
                    if (dto.getUserToken() != null) {
                        user = userRepository.findByFirebaseToken(dto.getUserToken())
                                .orElseThrow(() -> new ServiceException(
                                        "Utilisateur non trouvé pour le token: " + dto.getUserToken()));
                    }
                    if (user == null && dto.getUserId() != null) {
                        // assign to a default user (e.g., admin) if not found by token
                        user = userRepository.findById(1)
                                .orElseThrow(() -> new ServiceException(
                                        "Utilisateur par défaut non trouvé pour l'ID 1"));
                    }
                    s.setUser(user);

                    // Coordinates
                    Double x = dto.getX();
                    Double y = dto.getY();
                    // point
                    Point p = new Point();
                    p.setX(x != null ? x : 0.0);
                    p.setY(y != null ? y : 0.0);
                    p.setLocalisation(dto.getLocalisation() != null ? dto.getLocalisation() : "");
                    p.setFirestoreSynced(false);
                    pointRepository.save(p);
                    s.setPoint(p);
                    // description
                    s.setDescription(dto.getDescription());
                    // createdAt
                    if (dto.getCreatedAt() != null) {
                        s.setCreatedAt(dto.getCreatedAt());
                    } else {
                        s.setCreatedAt(now);
                    }

                    // status
                    s.setStatus(status);
                    // firestoreSynced
                    s.setFirestoreSynced(false);

                    SignalementHistory history = new SignalementHistory();
                    history.setSignalement(s);
                    history.setChangedAt(now);
                    history.setStatus(status);
                    signalementHistoryRepository.save(history);

                    Signalement saved = signalementRepository.save(s);
                    signalementHistoryRepository.save(history);

                    // Persist images associated to this signalement (if any).
                    // Download remote images (cheminOnline) into local folder ./uploads/signalement.
                    if (dto.getImages() != null) {
                        for (SignalementImageDTO imgDto : dto.getImages()) {
                            SignalementImage img = new SignalementImage();
                            String online = imgDto.getCheminOnline();
                            String localPath = imgDto.getCheminLocal();
                            String fileName = imgDto.getNomFichier();

                            if (online != null && !online.isBlank()) {
                                try {
                                    Path uploadsDir = Paths.get(uploadsBaseDir, "signalement");
                                    System.out.println("INFO: Preparing to download image for signalement " + saved.getId() + " from " + online);
                                    System.out.println("INFO: uploads.base-dir = " + uploadsBaseDir + ", uploads dir (before create): " + uploadsDir.toAbsolutePath());
                                    Files.createDirectories(uploadsDir);
                                    System.out.println("INFO: uploads dir (after create): " + uploadsDir.toAbsolutePath());
                                    
                                    URL url = new URL(online);
                                    
                                    String remoteName = fileName;
                                    if (remoteName == null || remoteName.isBlank()) {
                                        String path = url.getPath();
                                        remoteName = Paths.get(path).getFileName().toString();
                                    }
                                    
                                    String safeName = saved.getId() + "_" + System.currentTimeMillis() + "_" + remoteName;
                                    Path dest = uploadsDir.resolve(safeName);
                                    System.out.println("INFO: will save image to " + dest.toAbsolutePath());
                                    
                                    try (InputStream in = url.openStream()) {
                                        Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
                                    }
                                    
                                    localPath = dest.toString();
                                    img.setSignalement(saved);
                                    img.setCheminLocal(localPath);
                                    img.setCheminOnline(online);
                                    img.setNomFichier(remoteName);
                                    signalementImageRepository.save(img);
                                } catch (IOException ioEx) {
                                    System.out.println("ERROR: IOException while downloading image " + online + " for signalement " + saved.getId() + ": " + ioEx.getMessage());
                                    ioEx.printStackTrace();
                                    // preserve previous behavior: throw ServiceException to signal offline/network error
                                    throw new ServiceException("Impossible de télécharger l'image depuis le remote (hors connexion?) : " + online, ioEx);
                                } catch (Exception exImg) {
                                    System.out.println("WARN: Impossible de sauvegarder l'image pour signalement " + saved.getId() + ": " + exImg.getMessage());
                                    exImg.printStackTrace();
                                }
                            } else {
                                // No remote URL; save the record using provided local path if any
                                try {
                                    img.setSignalement(saved);
                                    img.setCheminLocal(localPath);
                                    img.setCheminOnline(online);
                                    img.setNomFichier(fileName);
                                    signalementImageRepository.save(img);
                                } catch (Exception imgEx) {
                                    System.out.println("WARN: Impossible de sauvegarder l'image locale pour signalement " + saved.getId() + ": " + imgEx.getMessage());
                                }
                            }
                        }
                    }

                    imported++;
                } catch (Exception inner) {
                    inner.printStackTrace();
                    logger.error("Erreur import DTO (description={}): {}", dto.getDescription(), inner.getMessage(),
                            inner);
                }
            }

            // After importing all DTOs, delete all documents in the Firestore collection to
            // clean up
            try {
                List<DocumentSnapshot> docs = firestoreService.fetchAllSignalementDocuments();
                for (DocumentSnapshot doc : docs) {
                    try {
                        firestoreService.deleteDocument("signalementAdd", doc.getId());
                    } catch (Exception exDel) {
                        System.out.println("WARN: Impossible de supprimer doc Firestore " + doc.getId() + ": " + exDel.getMessage());
                        throw exDel;
                    }
                }
            } catch (Exception eDelAll) {
                logger.error("Erreur lors de la suppression en masse des documents Firestore: {}", eDelAll.getMessage(),
                        eDelAll);
            }
        } catch (Exception e) {
            logger.error("Erreur synchronization Firestore", e);
            throw new ServiceException("Erreur lors de la synchronisation depuis Firestore", e);
        }

        return imported;
    }

    @Transactional
    public Probleme rapportTechnicien(RapportTech rapportTech) {
        Probleme probleme = null;

        try {
            LocalDateTime now = LocalDateTime.now();
            Signalement signalement = getById(rapportTech.getSignalementId())
                    .orElseThrow(() -> new ServiceException(
                            "Signalement non trouvé pour l'ID: " + rapportTech.getSignalementId()));
            Entreprise entreprise = entrepriseRepository.findById(rapportTech.getEntrepriseId())
                    .orElseThrow(() -> new ServiceException(
                            "Entreprise non trouvée pour l'ID: " + rapportTech.getEntrepriseId()));
            
            ProblemeStatus status = problemeStatusRepository.findByValeur(CREATE_STATUS_VALUE)
                    .orElseThrow(() -> new ServiceException("Statut initial du problème non trouvé"));

            SignalementStatus signalementStatus = statusSignalementRepository.findByValeur(RESOLVED_STATUS_VALUE)
                    .orElseThrow(() -> new ServiceException("Statut 'En cours de traitement' non trouvé"));
            

            //create probleme
            probleme = new Probleme();
            probleme.setSignalement(signalement);
            probleme.setSurface(rapportTech.getSurface());
            probleme.setBudgetEstime(rapportTech.getBudgetEstime());
            probleme.setEntreprise(entreprise);
            probleme.setProblemeStatus(status);
            probleme.setFirestoreSynced(false);
            // Update signalement status to resolved
            signalement.setStatus(signalementStatus);
            signalement.setFirestoreSynced(false);
            //history probleme
            ProblemeHistory problemeHistory = new ProblemeHistory();
            problemeHistory.setProbleme(probleme);
            problemeHistory.setStatus(status);
            problemeHistory.setChangedAt(now);
            //history signalement
            SignalementHistory signalementHistory = new SignalementHistory();
            signalementHistory.setSignalement(signalement);
            signalementHistory.setStatus(signalementStatus);
            signalementHistory.setChangedAt(now);

            //save
            signalementRepository.save(signalement);
            signalementHistoryRepository.save(signalementHistory);
            probleme = problemeRepository.save(probleme);
            problemeHistoryRepository.save(problemeHistory);


        } catch (Exception e) {
            logger.error("Erreur rapport technicien", e);
            throw new ServiceException("Erreur rapport technicien", e);
        }

        return probleme;
    }

    public List<Signalement> getSignalementsNonResolus() {
        try {
            return signalementRepository.findAllWithStatusOther();
        } catch (Exception e) {
            logger.error("Erreur lors de getSignalementsNonResolus", e);
            throw new ServiceException("Erreur lors de la récupération des signalements non résolus", e);
        }
    }

}
