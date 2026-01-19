package com.projet.lalana.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import com.projet.lalana.dto.SignalementRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FirestoreService {

    public List<SignalementRequest> getAllSignalementsEnvoyes() {
        Firestore db = FirestoreClient.getFirestore();
        List<SignalementRequest> signalementRequest = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> query = db.collection("signalements_problemes").get();
            QuerySnapshot querySnapshot = query.get();
            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                SignalementRequest sp = document.toObject(SignalementRequest.class);
                signalementRequest.add(sp);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return signalementRequest;
    }
}
