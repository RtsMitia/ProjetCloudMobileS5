package com.projet.lalana.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.projet.lalana.dto.SignalementRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FirestoreService {


    /**
     * Fetch raw Firestore documents from the `signalements_problemes` collection.
     */
    public List<DocumentSnapshot> fetchAllSignalementDocuments() {
        List<DocumentSnapshot> result = new ArrayList<>();
        Firestore db = FirestoreClient.getFirestore();
        try {
            ApiFuture<QuerySnapshot> query = db.collection("signalements_add").get();
            QuerySnapshot querySnapshot = query.get();
            if (querySnapshot != null) {
                result.addAll(querySnapshot.getDocuments());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * Delete a document in the specified collection by id. Returns true when delete completed.
     */
    public boolean deleteDocument(String collection, String docId) {
        Firestore db = FirestoreClient.getFirestore();
        try {
            ApiFuture<WriteResult> future = db.collection(collection).document(docId).delete();
            future.get();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
