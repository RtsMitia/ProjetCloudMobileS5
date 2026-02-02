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
import com.projet.lalana.dto.UserDTO;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final int UNBLOCKED_STATUS = 1;
    private final int BLOCKED_STATUS = 0;

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
            
            //history.setDescription(note != null && !note.isEmpty() ? note : "Déblocage manuel par administrateur");
            history.setChangedAt(LocalDateTime.now());
            history.setStatus(UNBLOCKED_STATUS); 

            UserHistory saved = userHistoryRepository.save(history);
            
            // Denormalize: set currentStatus on user
            user.setCurrentStatus(UNBLOCKED_STATUS);
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

    @Transactional
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
                String email = fu.getEmail();
                if (email == null || email.isEmpty()) {
                    continue;
                }

                Optional<User> uopt = userRepository.findByEmail(email);
                String fuUid = fu.getUid();

                if (uopt.isPresent()) {
                    // If local user exists, ensure firebaseToken is stored/updated
                    User user = uopt.get();
                    if (fuUid != null && !fuUid.isEmpty() && (user.getFirebaseToken() == null || user.getFirebaseToken().isEmpty() || !fuUid.equals(user.getFirebaseToken()))) {
                        user.setFirebaseToken(fuUid);
                        try {
                            userRepository.save(user);
                            logger.info("Rempli/maj firebaseToken pour l'utilisateur local {} (uid={})", user.getId(), fuUid);
                        } catch (Exception e) {
                            logger.error("Impossible de sauvegarder firebaseToken pour user id={}", user.getId(), e);
                        }
                    }

                    // If the Firebase account is disabled, create a local blocked history and denormalize
                    if (Boolean.TRUE.equals(fu.isDisabled())) {
                        try {
                            UserHistory history = new UserHistory();
                            history.setUser(user);
                            history.setChangedAt(LocalDateTime.now());
                            history.setStatus(BLOCKED_STATUS);
                            UserHistory saved = userHistoryRepository.save(history);

                            // Denormalize: set currentStatus on user and mark firestoreSynced
                            user.setCurrentStatus(BLOCKED_STATUS);
                            user.setFirestoreSynced(true);
                            userRepository.save(user);

                            created.add(saved);
                            logger.info("Utilisateur local {} bloqué (history id={}) suite à Firebase disabled", user.getId(), saved.getId());
                        } catch (Exception e) {
                            logger.error("Impossible de créer l'historique de blocage pour user email={}", email, e);
                        }
                    }
                } else {
                    // No local user — if Firebase UID exists, remove the Firebase user to keep Firebase clean
                    if (fuUid != null && !fuUid.isEmpty()) {
                        try {
                            firebaseService.getAuth().deleteUser(fuUid);
                            logger.info("Supprimé l'utilisateur Firebase uid={} car aucun utilisateur local trouvé pour email={}", fuUid, email);
                        } catch (Exception e) {
                            logger.error("Impossible de supprimer l'utilisateur Firebase uid={}", fuUid, e);
                        }
                    } else {
                        logger.info("Utilisateur Firebase avec email {} n'a pas d'uid et n'est pas présent en base locale : aucune action effectuée", email);
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

               
                    if(!user.getFirestoreSynced()) {
                        user.setFirestoreSynced(true);
                        if (currentStatus == UNBLOCKED_STATUS)  {
                        try {
                                firebaseService.getAuth().updateUser(
                                    new UpdateRequest(user.getFirebaseToken())
                                    .setDisabled(false)
                                );
                                logger.info("Utilisateur Firebase uid={} activé (local user id={})", user.getFirebaseToken(), user.getId());
                            } catch (Exception e) {
                                logger.error("Erreur lors de l'activation Firebase pour uid={}", user.getFirebaseToken(), e);
                            }
                        }
                        synced.add(user);
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

    public List<User> getAllUsers() {
        try {
            return userRepository.findAll();
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des utilisateurs", e);
            throw new ServiceException("Erreur lors de la récupération des utilisateurs", e);
        }
    }


    // Firebase initialization moved to FirebaseService

    /**
     * Update a user using a DTO. Only non-null DTO fields are applied (partial update).
     * If currentStatus changes, a UserHistory record is created.
     */
    @Transactional
    public User updateUserFromDTO(UserDTO dto) {
        if (dto == null) throw new ServiceException("UserDTO cannot be null");

        Integer id = dto.getId();
        if (id == null) throw new ServiceException("User id is required for update");

        try {
            Optional<User> uopt = userRepository.findById(id);
            if (uopt.isEmpty()) {
                throw new ServiceException("Utilisateur non trouvé id=" + id);
            }
            User user = uopt.get();

            // Track status change
            Integer oldStatus = user.getCurrentStatus() != null ? user.getCurrentStatus() : -1;

            if (dto.getEmail() != null) user.setEmail(dto.getEmail());
            if (dto.getPassword() != null) user.setPassword(dto.getPassword());
            if (dto.getFirebaseToken() != null) user.setFirebaseToken(dto.getFirebaseToken());
            if (dto.getCurrentStatus() != null) user.setCurrentStatus(dto.getCurrentStatus());
            user.setFirestoreSynced(false);

            User saved = userRepository.save(user);

            // If status changed, create a history record
            Integer newStatus = saved.getCurrentStatus() != null ? saved.getCurrentStatus() : -1;
            if (!newStatus.equals(oldStatus)) {
                UserHistory history = new UserHistory();
                history.setUser(saved);
                history.setChangedAt(LocalDateTime.now());
                history.setStatus(newStatus);
                userHistoryRepository.save(history);
            }

            return saved;
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour de l'utilisateur id={}", dto.getId(), e);
            throw new ServiceException("Erreur lors de la mise à jour de l'utilisateur", e);
        }
    }

}