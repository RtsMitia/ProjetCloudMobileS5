package com.projet.lalana.service;

import com.google.firebase.auth.ExportedUserRecord;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.auth.oauth2.GoogleCredentials;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import com.projet.lalana.model.User;
import com.projet.lalana.model.UserHistory;
import com.projet.lalana.repository.UserHistoryRepository;
import com.projet.lalana.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserHistoryRepository userHistoryRepository;
    private final AuthService authService;
    private final FirebaseService firebaseService;

    public UserHistory deblockUser(Integer userId, String note) {
        try {
            Optional<User> uopt = userRepository.findById(userId);
            if (uopt.isEmpty()) {
                throw new ServiceException("Utilisateur non trouvé id=" + userId);
            }
            User user = uopt.get();

            UserHistory history = new UserHistory();
            history.setUser(user);
            
            history.setChangedAt(LocalDateTime.now());
            history.setStatus(1); 

            UserHistory saved = userHistoryRepository.save(history);
            
            // Denormalize: set currentStatus on user
            user.setCurrentStatus(1);
            userRepository.save(user);
            
            logger.info("User {} débloqué, history id={}", userId, saved.getId());
            return saved;
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors du déblocage de l'utilisateur id={}", userId, e);
            throw new ServiceException("Erreur lors du déblocage de l'utilisateur", e);
        }
    }

    public List<ExportedUserRecord> getAllFirebaseUsers() throws Exception {

        List<ExportedUserRecord> users = new ArrayList<>();

    // Ensure FirebaseApp is initialized
    firebaseService.ensureInitialized();

    ListUsersPage page = firebaseService.getAuth().listUsers(null);
        while (page != null) {
            for (ExportedUserRecord user : page.getValues()) {
                users.add(user);
            }
            page = page.getNextPage();
        }

        return users;
    }

    public List<UserHistory> getDatasFromFirebase() {
        List<ExportedUserRecord> fireUsers;
        try {
            fireUsers = getAllFirebaseUsers();
        } catch (Exception e) {
            logger.error("Impossible de recuperer les utilisateurs Firebase", e);
            throw new ServiceException("Impossible de recuperer les utilisateurs Firebase", e);
        }

        List<UserHistory> created = new ArrayList<>();

        for (ExportedUserRecord fu : fireUsers) {
            try {
                if (Boolean.TRUE.equals(fu.isDisabled())) {
                    String email = fu.getEmail();
                    if (email == null || email.isEmpty()) {
                        continue;
                    }

                    Optional<User> uopt = userRepository.findByEmail(email);
                        if (uopt.isEmpty()) {
                            // If no corresponding local user exists, remove the user from Firebase
                            String fuUid = fu.getUid();
                            if (fuUid != null && !fuUid.isEmpty()) {
                                try {
                                    firebaseService.getAuth().deleteUser(fuUid);
                                    logger.info("Supprimé l'utilisateur Firebase uid={} car aucun utilisateur local trouvé pour email={}", fuUid, email);
                                } catch (Exception e) {
                                    logger.error("Impossible de supprimer l'utilisateur Firebase uid={}", fuUid, e);
                                }
                            } else {
                                logger.warn("Utilisateur Firebase sans uid trouvé pour email={}; impossible de supprimer", email);
                            }

                            continue;
                        }

                    User user = uopt.get();

        
                    String fuUid = fu.getUid();
                    if ((user.getFirebaseToken() == null || user.getFirebaseToken().isEmpty()) && fuUid != null && !fuUid.isEmpty()) {
                        user.setFirebaseToken(fuUid);
                        try {
                            userRepository.save(user);
                            logger.info("Rempli firebaseToken pour l'utilisateur local {} (uid={})", user.getId(), fuUid);
                        } catch (Exception e) {
                            logger.error("Impossible de sauvegarder firebaseToken pour user id={}", user.getId(), e);
                        }
                    }

                    Optional<UserHistory> last = userHistoryRepository.findTopByUserOrderByChangedAtDesc(user);
                    int lastStatus = last.map(UserHistory::getStatus).orElse(-1);

                    final int BLOCKED_STATUS = 0;
                    if (lastStatus != BLOCKED_STATUS) {
                        UserHistory history = new UserHistory();
                        history.setUser(user);
                        history.setChangedAt(LocalDateTime.now());
                        history.setStatus(BLOCKED_STATUS);

                        UserHistory saved = userHistoryRepository.save(history);
                        
                        // Denormalize: set currentStatus on user
                        user.setCurrentStatus(BLOCKED_STATUS);
                        userRepository.save(user);
                        
                        created.add(saved);
                        logger.info("Utilisateur local {} bloqué (history id={}) suite à Firebase disabled", user.getId(), saved.getId());
                    }
                }
            } catch (Exception e) {
                logger.error("Erreur lors du traitement de l'utilisateur Firebase uid={}", fu.getUid(), e);
            }
        }

        return created;
    }

    @Transactional
    public List<User> syncUnblockedUserToFirebase() {
        try {
            // Ensure FirebaseApp is initialized
            firebaseService.ensureInitialized();

            List<User> allUsers = userRepository.findAll();
            List<User> synced = new ArrayList<>();

            for (User user : allUsers) {
                try {

                    if (user.getFirebaseToken() == null || user.getFirebaseToken().isEmpty()) {
                        continue;
                    }

                    // Use denormalized currentStatus for faster check
                    Integer currentStatus = user.getCurrentStatus() != null ? user.getCurrentStatus() : -1;

                    final int UNBLOCKED_STATUS = 1;
                    if (currentStatus == UNBLOCKED_STATUS) {
                        try {
                            firebaseService.getAuth().updateUser(
                                new UpdateRequest(user.getFirebaseToken())
                                    .setDisabled(false)
                            );
                            synced.add(user);
                            logger.info("Utilisateur Firebase uid={} activé (local user id={})", user.getFirebaseToken(), user.getId());
                        } catch (Exception e) {
                            logger.error("Erreur lors de l'activation Firebase pour uid={}", user.getFirebaseToken(), e);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Erreur lors du traitement de l'utilisateur local id={}", user.getId(), e);
                }
            }

            return synced;
        } catch (Exception e) {
            logger.error("Erreur lors de la synchronisation des utilisateurs vers Firebase", e);
            throw new ServiceException("Erreur lors de la synchronisation vers Firebase", e);
        }
    }


    // Firebase initialization moved to FirebaseService

}