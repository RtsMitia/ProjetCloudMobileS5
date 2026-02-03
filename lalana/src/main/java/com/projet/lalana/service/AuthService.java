package com.projet.lalana.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.projet.lalana.model.User;
import com.projet.lalana.model.UserHistory;
import com.projet.lalana.repository.UserRepository;
import com.projet.lalana.repository.UserHistoryRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;

@Service
public class AuthService {

    // Status codes for UserHistory
    private static final int STATUS_LOGIN_SUCCESS = 1;
    private static final int STATUS_LOGIN_FAILED = 2;
    private static final int STATUS_ACCOUNT_LOCKED = 3;
    private static final int STATUS_ACCOUNT_UNLOCKED = 4;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String firebaseApiKey;
    private final UserRepository userRepository;
    private final UserHistoryRepository userHistoryRepository;
    private final Environment env;
    
    @Value("${security.max-login-attempts:3}")
    private int maxLoginAttempts;
    
    @Value("${security.lock-duration-minutes:15}")
    private int lockDurationMinutes;

    public AuthService(@Value("${firebase.api.key}") String firebaseApiKey, 
                      UserRepository userRepository,
                      UserHistoryRepository userHistoryRepository,
                      Environment env) {
        this.firebaseApiKey = firebaseApiKey;
        this.userRepository = userRepository;
        this.userHistoryRepository = userHistoryRepository;
        this.env = env;
        System.out.println("[DEBUG] spring.datasource.url=" + env.getProperty("spring.datasource.url"));
        System.out.println("[DEBUG] active firebase.api.key present=" + (this.firebaseApiKey != null && !this.firebaseApiKey.isEmpty()));
    }

    /**
     * Calls Firebase Identity Toolkit REST API to sign in with email and password.
     * Returns the parsed JSON response as a Map (on success contains idToken, refreshToken, expiresIn, localId, email, etc.).
     * On failure returns a map with keys `status` and `error` (error body string).
     */
    public Map<String, Object> signInWithEmailAndPassword(String email, String password) {
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + firebaseApiKey;

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("password", password);
        payload.put("returnSecureToken", true);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                Map<String, Object> err = new HashMap<>();
                err.put("status", response.getStatusCode().value());
                err.put("error", "Empty response body");
                return err;
            }
        } catch (HttpClientErrorException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", e.getStatusCode() != null ? e.getStatusCode().value() : HttpStatus.BAD_REQUEST.value());
            err.put("error", e.getResponseBodyAsString());
            return err;
        }
    }

    /**
     * Create user in Firebase and in local DB. If local DB save fails, attempts to rollback Firebase user deletion.
     * Returns a map: on success contains `firebase` (firebase response) and `local` (local user info).
     * On Firebase or local failure returns a map with `status` and `error` or descriptive error.
     */
    public Map<String, Object> createUser(String email, String password) {
        try {
            // Create user in Firebase via Admin SDK
                CreateRequest req = new CreateRequest()
                    .setEmail(email)
                    .setPassword(password);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(req);
            String uid = userRecord.getUid();

            try {
                User user = new User();
                user.setEmail(email);
                user.setPassword(password);
                User saved = userRepository.save(user);

                Map<String, Object> out = new HashMap<>();
                Map<String, Object> firebase = new HashMap<>();
                firebase.put("uid", uid);
                firebase.put("email", userRecord.getEmail());
                out.put("firebase", firebase);
                Map<String, Object> local = new HashMap<>();
                local.put("id", saved.getId());
                local.put("email", saved.getEmail());
                out.put("local", local);
                return out;
            } catch (Exception e) {
                // rollback firebase user
                try {
                    FirebaseAuth.getInstance().deleteUser(uid);
                } catch (Exception ex) {
                    System.out.println("Failed to rollback Firebase user uid=" + uid + " : " + ex.getMessage());
                }

                Map<String, Object> err = new HashMap<>();
                err.put("status", 500);
                err.put("error", "Erreur lors de la création locale de l'utilisateur: " + e.getMessage());
                return err;
            }
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", 400);
            err.put("error", "Firebase create user failed: " + e.getMessage());
            return err;
        }
    }


    // user firebase 
    public void createUserFirebase(User user)throws Exception {
        try {
            // Create user in Firebase via Admin SDK
                CreateRequest req = new CreateRequest()
                    .setEmail(user.getEmail())
                    .setPassword(user.getPassword());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(req);
            String uid = userRecord.getUid();


            try {
                
                user.setFirebaseToken(userRecord.getUid());
                System.out.println("\n[DEBUG] Created Firebase user uid=" + uid + " for local user id=" + user.getEmail());
                
            } catch (Exception e) {
                try {
                    FirebaseAuth.getInstance().deleteUser(uid);
                } catch (Exception ex) {
                    throw ex;
                }

                throw e;
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }


    /**
     * Local login fallback — verifies email/password against local DB.
     * Also checks for account locks and tracks failed attempts.
     */
    public User login(String email, String password) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            System.out.println("[DEBUG] userOpt present=" + userOpt.isPresent());
            userOpt.ifPresent(u -> System.out.println("[DEBUG] userOpt.email=" + u.getEmail()));

            if (userOpt.isEmpty()) {
                throw new ServiceException("Email ou mot de passe incorrect");
            }

            User user = userOpt.get();
            
            // Check if account is locked
            if (isAccountLocked(user)) {
                throw new ServiceException("Compte bloqué en raison de trop nombreuses tentatives de connexion. Veuillez réessayer plus tard.");
            }

            if (!password.equals(user.getPassword())) {
                // Record failed attempt
                recordFailedLoginAttempt(user);
                
                // Check if we should lock the account
                long failedAttempts = countRecentFailedAttempts(user);
                if (failedAttempts >= maxLoginAttempts) {
                    lockAccount(user);
                    throw new ServiceException("Compte bloqué en raison de trop nombreuses tentatives de connexion. Veuillez réessayer plus tard.");
                }
                
                throw new ServiceException("Email ou mot de passe incorrect");
            }

            // Successful login - record it and reset failed attempts
            recordSuccessfulLogin(user);
            System.out.println("User " + email + " logged in successfully (local)");
            return user;

        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            System.out.println("Erreur lors de la connexion pour l'email " + email + " : " + e.getMessage());
            throw new ServiceException("Erreur lors de la connexion", e);
        }
    }
    
    /**
     * Check if user account is currently locked
     */
    private boolean isAccountLocked(User user) {
        Optional<UserHistory> lockRecord = userHistoryRepository.findLatestByUserAndStatus(user, STATUS_ACCOUNT_LOCKED);
        
        if (lockRecord.isEmpty()) {
            return false;
        }
        
        LocalDateTime lockTime = lockRecord.get().getChangedAt();
        LocalDateTime unlockTime = lockTime.plusMinutes(lockDurationMinutes);
        
        // Check if lock has expired
        if (LocalDateTime.now().isAfter(unlockTime)) {
            // Lock has expired, record unlock
            autoUnlockAccount(user);
            return false;
        }
        
        return true;
    }
    
    /**
     * Count recent failed login attempts within the lock duration window
     */
    private long countRecentFailedAttempts(User user) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(lockDurationMinutes);
        return userHistoryRepository.countByUserAndStatusSince(user, STATUS_LOGIN_FAILED, since);
    }
    
    /**
     * Record a failed login attempt in history
     */
    private void recordFailedLoginAttempt(User user) {
        UserHistory history = new UserHistory();
        history.setUser(user);
        history.setStatus(STATUS_LOGIN_FAILED);
        history.setChangedAt(LocalDateTime.now());
        //history.setDescription("Tentative de connexion échouée");
        userHistoryRepository.save(history);
    }
    
    /**
     * Record a successful login in history
     */
    private void recordSuccessfulLogin(User user) {
        UserHistory history = new UserHistory();
        history.setUser(user);
        history.setStatus(STATUS_LOGIN_SUCCESS);
        history.setChangedAt(LocalDateTime.now());

        userHistoryRepository.save(history);
    }
    
    /**
     * Lock user account after max failed attempts
     */
    private void lockAccount(User user) {
        UserHistory history = new UserHistory();
        history.setUser(user);
        history.setStatus(STATUS_ACCOUNT_LOCKED);
        history.setChangedAt(LocalDateTime.now());
        //history.setDescription("Compte bloqué après " + maxLoginAttempts + " tentatives échouées");
        userHistoryRepository.save(history);
        System.out.println("Account locked for user: " + user.getEmail());
    }
    
    /**
     * Auto-unlock account when lock duration expires
     */
    private void autoUnlockAccount(User user) {
        UserHistory history = new UserHistory();
        history.setUser(user);
        history.setStatus(STATUS_ACCOUNT_UNLOCKED);
        history.setChangedAt(LocalDateTime.now());
        //history.setDescription("Déblocage automatique après expiration du délai");
        userHistoryRepository.save(history);
        System.out.println("Account auto-unlocked for user: " + user.getEmail());
    }

    /**
     * Try to authenticate using Firebase first; on any failure fall back to local DB login.
     * Returns a Map: when Firebase is used it returns the raw Firebase response map; when local
     * fallback is used it returns a map with keys `local`=true and `user` containing basic user info.
     */
    public Map<String, Object> authenticate(String email, String password) {
        try {
            Map<String, Object> firebaseResp = signInWithEmailAndPassword(email, password);
            // If firebase returned an idToken, consider it successful
            // if (firebaseResp != null && firebaseResp.containsKey("idToken")) {
            //     System.out.println("Authenticated " + email + " via Firebase");
            //     return firebaseResp;
            // }

            // If response contains an error/status or no idToken, log and immediately fallback to local
            // System.out.println("Firebase sign-in did not return idToken for " + email + ": " + firebaseResp + " — falling back to local login");
            User user = login(email, password);
            Map<String, Object> out = new HashMap<>();
            out.put("local", true);
            Map<String, Object> u = new HashMap<>();

            u.put("id", user.getId());
            u.put("email", user.getEmail());
            u.put("token", user.getFirebaseToken());
            out.put("user", u);

            System.out.println("Authenticated " + email + " via local DB" + user.getFirebaseToken());
            return out;
        } catch (Exception e) {
            throw new ServiceException("Échec de l'authentification: " + e.getMessage(), e);
        }
    }

}
