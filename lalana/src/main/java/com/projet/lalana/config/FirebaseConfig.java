package com.projet.lalana.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void init() {
        // Try classpath first, then file system path
        InputStream serviceAccount = null;
        try {
            ClassPathResource resource = new ClassPathResource("firebase-key.json");
            if (resource.exists()) {
                serviceAccount = resource.getInputStream();
                logger.info("Loaded firebase-key.json from classpath");
            } else {
                try {
                    serviceAccount = new FileInputStream("firebase-key.json");
                    logger.info("Loaded firebase-key.json from filesystem");
                } catch (Exception ex) {
                    logger.warn("firebase-key.json not found on classpath or filesystem: {}", ex.getMessage());
                }
            }

            if (serviceAccount == null) {
                logger.warn("Firebase service account not provided; Firebase will not be initialized.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                logger.info("FirebaseApp initialized");
            } else {
                logger.info("FirebaseApp already initialized");
            }

        } catch (Exception e) {
            logger.error("Failed to initialize FirebaseApp: {}", e.getMessage(), e);
        } finally {
            if (serviceAccount != null) {
                try {
                    serviceAccount.close();
                } catch (Exception ignored) {
                }
            }
        }
    }
}
