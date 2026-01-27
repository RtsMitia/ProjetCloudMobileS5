package com.projet.lalana.service;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.UserHistory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SynchroService {

    private static final Logger logger = LoggerFactory.getLogger(SynchroService.class);

    private final SignalementService signalementService;
    private final ProblemeService problemeService;
    private final UserService userService;

    /**
     * Run a full synchronization cycle:
     * - import signalements from Firestore into DB
     * - sync blocked users from Firebase -> local (user histories)
     * - sync unblocked users from local -> Firebase
     * Returns a summary object containing imported counts and current data snapshots.
     */
    @Transactional
    public SyncResult fullSync() {
        try {
            // 1) Import signalements from Firestore
            int importedSignalements = signalementService.synchronisation();

            // 2) Sync blocked users from Firebase into local DB (creates UserHistory entries)
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
            logger.error("Erreur lors de la synchronisation générale", e);
            throw new ServiceException("Erreur lors de la synchronisation générale", e);
        }
    }

    public static class SyncResult {
        private int importedSignalements;
        private int blockedCount;
        private int reactivatedCount;
        private List<Signalement> signalements;
        private List<Probleme> problemes;

        public int getImportedSignalements() { return importedSignalements; }
        public void setImportedSignalements(int importedSignalements) { this.importedSignalements = importedSignalements; }

        public int getBlockedCount() { return blockedCount; }
        public void setBlockedCount(int blockedCount) { this.blockedCount = blockedCount; }

        public int getReactivatedCount() { return reactivatedCount; }
        public void setReactivatedCount(int reactivatedCount) { this.reactivatedCount = reactivatedCount; }

        public List<Signalement> getSignalements() { return signalements; }
        public void setSignalements(List<Signalement> signalements) { this.signalements = signalements; }

        public List<Probleme> getProblemes() { return problemes; }
        public void setProblemes(List<Probleme> problemes) { this.problemes = problemes; }
    }
}
