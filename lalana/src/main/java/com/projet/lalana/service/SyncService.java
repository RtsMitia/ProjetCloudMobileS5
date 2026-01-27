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

@Service
@RequiredArgsConstructor
public class SyncService {

    private final SignalementRepository signalementRepository;
    private final ProblemeRepository problemeRepository;

    /**
     * Sync only unsynced signalements with status_id = 1 to Firestore using SignalementDto.
     */
    public Map<String, Object> syncAll() {
        Map<String, Object> result = new HashMap<>();
        result.put("signalements", syncSignalements());
        result.put("deleted_signalements", deleteSignalementsValeur30());
        result.put("deleted_problemes", deleteProblemesValeur30());
        return result;
    }

    public int syncSignalements() {
        // fetch signalements whose status.valeur <= 10; do not check or update firestore_synced for now
        List<Signalement> rows = signalementRepository.findByStatusValeurLE10();
        int count = 0;
        Firestore db = FirestoreClient.getFirestore();

        for (Signalement s : rows) {
            String docId = String.valueOf(s.getId());
            SignalementDto dto = SignalementDto.fromEntity(s);
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", dto.getId());
            doc.put("userId", dto.getUserId());
            doc.put("x", dto.getX());
            doc.put("y", dto.getY());
            doc.put("localisation", dto.getLocalisation());
            doc.put("description", dto.getDescription());
            doc.put("createdAt", dto.getCreatedAt() != null ? dto.getCreatedAt().toString() : null);
            doc.put("statusLibelle", dto.getStatusLibelle());
            doc.put("valeur", dto.getValeur());

            try {
                DocumentReference ref = db.collection("signalements").document(docId);
                ApiFuture<WriteResult> w = ref.set(doc);
                w.get();
                // do not modify firestore_synced field for now
                count++;
            } catch (Exception e) {
                System.out.println("Failed to sync signalement id=" + s.getId() + " : " + e.getMessage());
            }
        }
        return count;
    }

    public int deleteSignalementsValeur30() {
        int deleted = 0;
        Firestore db = FirestoreClient.getFirestore();
        try {
            ApiFuture<QuerySnapshot> future = db.collection("signalements").whereEqualTo("valeur", 30).get();
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


}
