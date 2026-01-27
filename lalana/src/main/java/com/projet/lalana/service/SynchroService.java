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
    private final SyncService syncService;

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
            // Delegate to SyncService combined full-sync flow
            java.util.Map<String, Object> report = syncService.runFullSyncCycle();

            SyncResult result = new SyncResult();
            result.setImportedSignalements((int) report.getOrDefault("imported_signalements", 0));
            result.setBlockedCount((int) report.getOrDefault("blocked_histories", 0));
            result.setReactivatedCount((int) report.getOrDefault("reactivated", 0));
            result.setSignalements((java.util.List<Signalement>) report.getOrDefault("all_signalements", signalementService.getAll()));
            result.setProblemes((java.util.List<Probleme>) report.getOrDefault("all_problemes", problemeService.getAll()));

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
