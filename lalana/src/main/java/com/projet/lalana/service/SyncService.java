package com.projet.lalana.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.projet.lalana.model.Point;
import com.projet.lalana.model.Probleme;
import com.projet.lalana.model.ProblemeStatus;
import com.projet.lalana.model.Signalement;
import com.projet.lalana.model.SignalementStatus;
import com.projet.lalana.repository.PointRepository;
import com.projet.lalana.repository.ProblemeRepository;
import com.projet.lalana.repository.ProblemeStatusRepository;
import com.projet.lalana.repository.SignalementRepository;
import com.projet.lalana.repository.SignalementStatusRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final PointRepository pointRepository;
    private final SignalementStatusRepository statusRepository;
    private final SignalementRepository signalementRepository;
    private final ProblemeStatusRepository problemeStatusRepository;
    private final ProblemeRepository problemeRepository;

    /**
     * Sync all unsynced rows to Firestore and mark them as synced locally.
     */
    public Map<String, Object> syncAll() {
        Map<String, Object> result = new HashMap<>();
        result.put("points", syncPoints());
        result.put("signalement_status", syncSignalementStatus());
        result.put("signalements", syncSignalements());
        result.put("probleme_status", syncProblemeStatus());
        result.put("problemes", syncProblemes());
        return result;
    }

    public int syncPoints() {
        List<Point> rows = pointRepository.findByFirestoreSyncedFalse();
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (Point p : rows) {
            String docId = String.valueOf(p.getId());
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", p.getId());
            doc.put("x", p.getX());
            doc.put("y", p.getY());
            doc.put("localisation", p.getLocalisation());

            try {
                DocumentReference ref = db.collection("points").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get(); // wait for completion

                // mark local as synced in transaction
                markPointSynced(p.getId());
                count++;
            } catch (Exception e) {
                System.out.println("Failed to sync point id=" + p.getId() + " : " + e.getMessage());
            }
        }
        return count;
    }

    public int syncSignalementStatus() {
        List<SignalementStatus> rows = statusRepository.findByFirestoreSyncedFalse();
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (SignalementStatus s : rows) {
            String docId = String.valueOf(s.getId());
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", s.getId());
            doc.put("nom", s.getNom());
            doc.put("description", s.getDescription());

            try {
                DocumentReference ref = db.collection("signalement_status").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get();
                markSignalementStatusSynced(s.getId());
                count++;
            } catch (Exception e) {
                System.out.println("Failed to sync signalement_status id=" + s.getId() + " : " + e.getMessage());
            }
        }
        return count;
    }

    public int syncSignalements() {
        List<Signalement> rows = signalementRepository.findByFirestoreSyncedFalse();
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (Signalement s : rows) {
            String docId = String.valueOf(s.getId());
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", s.getId());
            doc.put("user_id", s.getUser() != null ? s.getUser().getId() : null);
            doc.put("point_id", s.getPoint() != null ? s.getPoint().getId() : null);
            doc.put("description", s.getDescription());
            doc.put("created_at", s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
            doc.put("status_id", s.getStatus() != null ? s.getStatus().getId() : null);

            try {
                DocumentReference ref = db.collection("signalements").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get();
                markSignalementSynced(s.getId());
                count++;
            } catch (Exception e) {
                System.out.println("Failed to sync signalement id=" + s.getId() + " : " + e.getMessage());
            }
        }
        return count;
    }

    public int syncProblemeStatus() {
        List<ProblemeStatus> rows = problemeStatusRepository.findByFirestoreSyncedFalse();
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (ProblemeStatus s : rows) {
            String docId = String.valueOf(s.getId());
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", s.getId());
            doc.put("nom", s.getNom());
            doc.put("description", s.getDescription());
            doc.put("valeur", s.getValeur());

            try {
                DocumentReference ref = db.collection("probleme_status").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get();
                markProblemeStatusSynced(s.getId());
                count++;
            } catch (Exception e) {
                System.out.println("Failed to sync probleme_status id=" + s.getId() + " : " + e.getMessage());
            }
        }
        return count;
    }

    public int syncProblemes() {
        List<Probleme> rows = problemeRepository.findByFirestoreSyncedFalse();
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (Probleme p : rows) {
            String docId = String.valueOf(p.getId());
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", p.getId());
            doc.put("signalement_id", p.getSignalement() != null ? p.getSignalement().getId() : null);
            doc.put("surface", p.getSurface());
            doc.put("budget_estime", p.getBudgetEstime());
            doc.put("entreprise_id", p.getEntreprise() != null ? p.getEntreprise().getId() : null);
            doc.put("status_id", p.getProblemeStatus() != null ? p.getProblemeStatus().getId() : null);

            try {
                DocumentReference ref = db.collection("problemes").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get();
                markProblemeSynced(p.getId());
                count++;
            } catch (Exception e) {
                System.out.println("Failed to sync probleme id=" + p.getId() + " : " + e.getMessage());
            }
        }
        return count;
    }

    @Transactional
    protected void markPointSynced(Integer id) {
        Point p = pointRepository.findById(id).orElseThrow(() -> new RuntimeException("Point not found " + id));
        p.setFirestoreSynced(true);
        pointRepository.save(p);
    }

    @Transactional
    protected void markSignalementStatusSynced(Integer id) {
        SignalementStatus s = statusRepository.findById(id).orElseThrow(() -> new RuntimeException("Status not found " + id));
        s.setFirestoreSynced(true);
        statusRepository.save(s);
    }

    @Transactional
    protected void markSignalementSynced(Integer id) {
        Signalement s = signalementRepository.findById(id).orElseThrow(() -> new RuntimeException("Signalement not found " + id));
        s.setFirestoreSynced(true);
        signalementRepository.save(s);
    }

    @Transactional
    protected void markProblemeStatusSynced(Integer id) {
        ProblemeStatus s = problemeStatusRepository.findById(id).orElseThrow(() -> new RuntimeException("ProblemeStatus not found " + id));
        s.setFirestoreSynced(true);
        problemeStatusRepository.save(s);
    }

    @Transactional
    protected void markProblemeSynced(Integer id) {
        Probleme p = problemeRepository.findById(id).orElseThrow(() -> new RuntimeException("Probleme not found " + id));
        p.setFirestoreSynced(true);
        problemeRepository.save(p);
    }
}
