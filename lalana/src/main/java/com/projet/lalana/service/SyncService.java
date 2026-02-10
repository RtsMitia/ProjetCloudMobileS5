package com.projet.lalana.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.projet.lalana.dto.SignalementDto;
import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.repository.ProblemeRepository;
import com.projet.lalana.repository.SignalementRepository;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.projet.lalana.model.UserHistory;
import com.projet.lalana.service.UserService;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final SignalementRepository signalementRepository;
    private final ProblemeRepository problemeRepository;
    private final SignalementService signalementService;
    private final ProblemeService problemeService;
    private final UserService userService;
    private final FcmNotificationService fcmNotificationService;

    private static final Logger logger = LoggerFactory.getLogger(SyncService.class);

    /**
     * Sync only unsynced signalements with status_id = 1 to Firestore using
     * SignalementDto.
     */
    public Map<String, Object> syncAll() {
        // For backward compatibility keep syncAll as a lightweight push->firestore
        // helper
        Map<String, Object> result = new HashMap<>();
        result.put("pushed_signalements", syncSignalements());
        result.put("deleted_signalements", deleteSignalementsValeur30());
        result.put("deleted_problemes", deleteProblemesValeur30());
        return result;
    }

    /**
     * Run a full synchronization cycle combining both sync directions and user
     * syncs.
     * - push local signalements to Firestore
     * - remove Firestore docs with valeur=30
     * - import signalements from Firestore into local DB
     * (signalementService.synchronisation())
     * - sync disabled Firebase users -> local (user histories) and delete unmatched
     * Firebase users
     * - push local unblocked users -> Firebase
     * Returns a map with detailed counts and snapshots.
     */
    @Transactional
    public Map<String, Object> runFullSyncCycle() {
        Map<String, Object> result = new HashMap<>();

        // 4) users: firebase -> local (blocked)
        List<UserHistory> blockedHistories = null;
        try {
            blockedHistories = userService.getDatasFromFirebase();
            result.put("blocked_histories", blockedHistories != null ? blockedHistories.size() : 0);
        } catch (Exception e) {
            logger.error("Failed to sync blocked users from Firebase to local", e);
            result.put("blocked_histories", 0);
        }

        // 5) users: local -> firebase (reactivate)
        List<com.projet.lalana.model.User> reactivated = null;
        try {
            reactivated = userService.syncUnblockedUserToFirebase();
            result.put("reactivated", reactivated != null ? reactivated.size() : 0);
        } catch (Exception e) {
            logger.error("Failed to push unblocked users to Firebase", e);
            result.put("reactivated", 0);
        }
        // 3) import firestore -> local
        int imported = 0;
        try {
            imported = signalementService.synchronisation();
        } catch (Exception e) {
            logger.error("Failed to import signalements from Firestore", e);
        }
        result.put("imported_signalements", imported);

        // 1) push local -> Firestore
        int pushed = syncSignalements();
        result.put("pushed_signalements", pushed);

        // 2) cleanup firestore
        int delSig = deleteSignalementsValeur30();
        int delProb = deleteProblemesValeur30();
        result.put("deleted_signalements", delSig);
        result.put("deleted_problemes", delProb);

        // 6) snapshots
        try {
            result.put("all_signalements", signalementService.getAll());
        } catch (Exception ignored) {
        }
        try {
            result.put("all_problemes", problemeService.getAll());
        } catch (Exception ignored) {
        }

        return result;
    }

    public int syncSignalements() {
        System.out.println("🚀 [SYNC] Démarrage de la synchronisation des signalements...");
        List<Signalement> rows = signalementRepository.findByStatusValeurLE10();
        System.out.println("📊 [SYNC] Nombre de signalements à synchroniser: " + rows.size());
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (Signalement s : rows) {
            String docId = String.valueOf(s.getId());
            SignalementDto dto = SignalementDto.fromEntity(s);
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", dto.getId());
            doc.put("userId", dto.getUserId());
            doc.put("userToken", dto.getUserToken());
            doc.put("x", dto.getX());
            doc.put("y", dto.getY());
            doc.put("localisation", dto.getLocalisation());
            doc.put("description", dto.getDescription());
            doc.put("createdAt", dto.getCreatedAt() != null ? dto.getCreatedAt().toString() : null);
            doc.put("statusLibelle", dto.getStatusLibelle());
            doc.put("valeur", dto.getValeur());

            try {
                DocumentReference ref = db.collection("signalementListe").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get();
                markSignalementSynced(s.getId());
                count++;

                // ✅ S'assurer que le document userTokens existe dans Firestore pour cet
                // utilisateur
                if (dto.getUserToken() != null && !dto.getUserToken().isEmpty() && dto.getUserId() != null) {
                    try {
                        fcmNotificationService.ensureUserTokenDocExists(
                                dto.getUserToken(),
                                null,
                                dto.getUserId());
                    } catch (Exception e) {
                        System.out.println("⚠️ [SYNC] Erreur lors de la création du userToken doc: " + e.getMessage());
                    }
                }

                // ✅ Envoi direct de notification FCM après sync réussie
                System.out.println("🔍 [SYNC] Vérification notification pour signalement id=" + dto.getId()
                        + ", userId=" + dto.getUserId() + ", token=" +
                        (dto.getUserToken() != null
                                ? dto.getUserToken().substring(0, Math.min(20, dto.getUserToken().length())) + "..."
                                : "null"));

                if (dto.getUserToken() != null && !dto.getUserToken().isEmpty() &&
                        dto.getUserId() != null) {
                    System.out.println(
                            "✅ [SYNC] Conditions remplies, appel du service FCM pour signalement id=" + dto.getId());
                    try {
                        boolean notifSent = fcmNotificationService.sendSignalementCreatedNotification(
                                dto.getId(),
                                String.valueOf(dto.getUserId()),
                                dto.getUserToken(),
                                dto.getDescription());
                        if (notifSent) {
                            System.out.println("📧 [SYNC] Notification FCM envoyée avec succès pour signalement id="
                                    + dto.getId());
                        } else {
                            System.out.println(
                                    "⚠️ [SYNC] Échec envoi notification FCM pour signalement id=" + dto.getId());
                        }
                    } catch (Exception notifError) {
                        // On ne fait pas échouer la sync si la notification échoue
                        System.out.println("❌ [SYNC] Exception lors de l'envoi de notification pour signalement id="
                                + dto.getId() + ": " + notifError.getMessage());
                        notifError.printStackTrace();
                    }
                } else {
                    System.out.println("⚠️ [SYNC] Conditions non remplies pour notification: userId=" + dto.getUserId()
                            + ", token présent=" +
                            (dto.getUserToken() != null && !dto.getUserToken().isEmpty()));
                }
            } catch (Exception e) {
                System.out.println("❌ [SYNC] Erreur sync signalement id=" + s.getId() + ": " + e.getMessage());
            }
        }
        System.out.println("✅ [SYNC] Synchronisation terminée: " + count + " signalement(s) synchronisé(s) sur "
                + rows.size() + " trouvé(s)");
        return count;
    }

    public int deleteSignalementsValeur30() {
        int deleted = 0;
        Firestore db = FirestoreClient.getFirestore();
        try {
            ApiFuture<QuerySnapshot> future = db.collection("signalementListe").whereEqualTo("valeur", 30).get();
            QuerySnapshot querySnapshot = future.get();
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                try {
                    ApiFuture<com.google.cloud.firestore.WriteResult> w = doc.getReference().delete();
                    w.get();
                    deleted++;
                } catch (Exception e) {
                    System.out.println("Failed to delete signalement doc id=" + doc.getId() + " : " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to query signalements in Firestore: " + e.getMessage());
        }
        return deleted;
    }

    public int deleteProblemesValeur30() {
        int deleted = 0;
        Firestore db = FirestoreClient.getFirestore();
        try {
            ApiFuture<QuerySnapshot> future = db.collection("problemes").whereEqualTo("valeur", 30).get();
            QuerySnapshot querySnapshot = future.get();
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                try {
                    ApiFuture<com.google.cloud.firestore.WriteResult> w = doc.getReference().delete();
                    w.get();
                    deleted++;
                } catch (Exception e) {
                    System.out.println("Failed to delete probleme doc id=" + doc.getId() + " : " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to query problemes in Firestore: " + e.getMessage());
        }
        return deleted;
    }

    @Transactional
    public SyncResult fullSync() {
        try {
            // 1) Import signalements from Firestore
            int importedSignalements = signalementService.synchronisation();

            // 2) Sync blocked users from Firebase into local DB (creates UserHistory
            // entries)
            List<UserHistory> blockedHistories = userService.getDatasFromFirebase();

            // 3) Push local unblocked users back to Firebase
            List<com.projet.lalana.model.User> reactivated = userService.syncUnblockedUserToFirebase();

            // 4) Prepare current snapshots to return
            List<Signalement> allSignalements = signalementService.getAll();
            List<Probleme> allProblemes = problemeService.getAll();

            SyncResult result = new SyncResult();
            result.setImportedSignalements(importedSignalements);
            result.setBlockedCount(blockedHistories != null ? blockedHistories.size() : 0);
            result.setReactivatedCount(reactivated != null ? reactivated.size() : 0);
            result.setSignalements(allSignalements);
            result.setProblemes(allProblemes);

            return result;
        } catch (Exception e) {
            throw new ServiceException("Erreur lors de la synchronisation générale", e);
        }
    }

    @Transactional
    protected void markSignalementSynced(Integer id) {
        Signalement s = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement not found " + id));
        s.setFirestoreSynced(true);
        signalementRepository.save(s);
    }

    public static class SyncResult {
        private int importedSignalements;
        private int blockedCount;
        private int reactivatedCount;
        private List<Signalement> signalements;
        private List<Probleme> problemes;

        public int getImportedSignalements() {
            return importedSignalements;
        }

        public void setImportedSignalements(int importedSignalements) {
            this.importedSignalements = importedSignalements;
        }

        public int getBlockedCount() {
            return blockedCount;
        }

        public void setBlockedCount(int blockedCount) {
            this.blockedCount = blockedCount;
        }

        public int getReactivatedCount() {
            return reactivatedCount;
        }

        public void setReactivatedCount(int reactivatedCount) {
            this.reactivatedCount = reactivatedCount;
        }

        public List<Signalement> getSignalements() {
            return signalements;
        }

        public void setSignalements(List<Signalement> signalements) {
            this.signalements = signalements;
        }

        public List<Probleme> getProblemes() {
            return problemes;
        }

        public void setProblemes(List<Probleme> problemes) {
            this.problemes = problemes;
        }
    }
}
