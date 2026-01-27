package com.projet.lalana.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Map;

@Service
public class FirebaseService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseService.class);

    private volatile boolean initialized = false;

    public synchronized void ensureInitialized() throws Exception{
        if (initialized) return;

        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                initialized = true;
                logger.info("FirebaseApp already initialized (existing apps)");
                return;
            }

            InputStream serviceAccount = null;

            // Prefer explicit env var path for CI/containers
            String envPath = System.getenv("FIREBASE_KEY_PATH");
            if (envPath != null && !envPath.isBlank()) {
                File f = new File(envPath);
                if (f.exists()) {
                    serviceAccount = new FileInputStream(f);
                    logger.info("Loaded firebase-key.json from env FIREBASE_KEY_PATH={}", envPath);
                } else {
                    logger.warn("FIREBASE_KEY_PATH is set but file does not exist: {}", envPath);
                }
            }

            if (serviceAccount == null) {
                // try working directory
                File f = new File("firebase-key.json");
                if (f.exists()) {
                    serviceAccount = new FileInputStream(f);
                    logger.info("Loaded firebase-key.json from working directory");
                }
            }

            if (serviceAccount == null) {
                ClassPathResource resource = new ClassPathResource("firebase-key.json");
                if (resource.exists()) {
                    serviceAccount = resource.getInputStream();
                    logger.info("Loaded firebase-key.json from classpath");
                }
            }

            if (serviceAccount == null) {
                // Do not silently continue: fail fast so callers know Firebase isn't available
                String msg = "Firebase service account JSON not found; looked for FIREBASE_KEY_PATH env var, working dir 'firebase-key.json' and classpath resource 'firebase-key.json'";
                logger.error(msg);
                throw new ServiceException(msg);
            }

            // Read the JSON content so we can detect and fix common problems (escaped \n in private_key)
            String json;
            try {
                byte[] raw = serviceAccount.readAllBytes();
                json = new String(raw, java.nio.charset.StandardCharsets.UTF_8);
            } finally {
                try { serviceAccount.close(); } catch (Exception ignored) {}
            }

            // Detect escaped newlines in the private_key field (common when storing JSON in env vars)
            if (json.contains("\\\\n-----BEGIN PRIVATE KEY-----" ) || (json.contains("\\n-----BEGIN PRIVATE KEY-----") && !json.contains("\n-----BEGIN PRIVATE KEY-----"))) {
                    logger.warn("Detected escaped newlines in service account JSON private_key; attempting to fix by unescaping \"\\n\" sequences.");
                json = json.replace("\\\\n", "\\n");
                // Also replace literal \n sequences (backslash + n) with actual newlines
                json = json.replace("\\n", "\n");
            }

            // Create a new InputStream from the possibly-fixed JSON
            InputStream cleaned = new java.io.ByteArrayInputStream(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Attempt to read credentials and provide diagnostic logs if they look invalid
            GoogleCredentials credentials = GoogleCredentials.fromStream(cleaned);

            // Try to log some identifying metadata without exposing secrets
            try {
                if (credentials instanceof ServiceAccountCredentials) {
                    String clientEmail = ((ServiceAccountCredentials) credentials).getClientEmail();
                    logger.info("Loaded GoogleCredentials clientEmail={}", clientEmail);
                }
            } catch (Exception e) {
                // ignore
            }

            // Validate credentials by attempting to fetch an access token once - this surfaces invalid JWT signature errors early.
            try {
                // refreshAccessToken may perform a network call; catch IO errors and surface a helpful message
                credentials.refreshAccessToken();
                logger.info("GoogleCredentials validated (access token acquired)");
            } catch (Exception ex) {
                logger.error("Failed to refresh GoogleCredentials access token: {}", ex.getMessage(), ex);
                throw new ServiceException("Firebase service account appears invalid: " + ex.getMessage(), ex);
            }
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            initialized = true;
            logger.info("FirebaseApp initialized successfully");

        } catch (Exception e) {
            logger.error("Failed to initialize FirebaseApp: {}", e.getMessage(), e);
            throw new ServiceException("Failed to initialize FirebaseApp: " + e.getMessage(), e);
        }
    }

    public FirebaseAuth getAuth() throws Exception {
        ensureInitialized();
        return FirebaseAuth.getInstance();
    }

    public Firestore getFirestore() throws Exception {
        ensureInitialized();
        return FirestoreClient.getFirestore();
    }
}
