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
import com.projet.lalana.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String firebaseApiKey;
    private final UserRepository userRepository;
    private final Environment env;

    public AuthService(@Value("${firebase.api.key}") String firebaseApiKey, UserRepository userRepository, Environment env) {
        this.firebaseApiKey = firebaseApiKey;
        this.userRepository = userRepository;
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
     * Local login fallback — verifies email/password against local DB.
     */
    public User login(String email, String password) {
        System.out.println("[DEBUG] spring.datasource.url=" + env.getProperty("spring.datasource.url"));
        System.out.println("[DEBUG] login called with email=" + email);
        try {
            List<User> allUsers = userRepository.findAll();
            System.out.println("[DEBUG] users.count=" + allUsers.size());
            allUsers.forEach(u -> System.out.println("[DEBUG] DB USER id=" + u.getId() + " email='" + u.getEmail() + "'"));

            Optional<User> userOpt = userRepository.findByEmail(email);
            System.out.println("[DEBUG] userOpt present=" + userOpt.isPresent());
            userOpt.ifPresent(u -> System.out.println("[DEBUG] userOpt.email=" + u.getEmail()));

            if (userOpt.isEmpty()) {
                throw new ServiceException("Email ou mot de passe incorrect");
            }

            User user = userOpt.get();

            if (!password.equals(user.getPassword())) {
                throw new ServiceException("Email ou mot de passe incorrect");
            }

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
     * Try to authenticate using Firebase first; on any failure fall back to local DB login.
     * Returns a Map: when Firebase is used it returns the raw Firebase response map; when local
     * fallback is used it returns a map with keys `local`=true and `user` containing basic user info.
     */
    public Map<String, Object> authenticate(String email, String password) {
        try {
            Map<String, Object> firebaseResp = signInWithEmailAndPassword(email, password);
            // If firebase returned an idToken, consider it successful
            if (firebaseResp != null && firebaseResp.containsKey("idToken")) {
                System.out.println("Authenticated " + email + " via Firebase");
                return firebaseResp;
            }

            // If response contains an error/status or no idToken, log and immediately fallback to local
            System.out.println("Firebase sign-in did not return idToken for " + email + ": " + firebaseResp + " — falling back to local login");
            User user = login(email, password);
            Map<String, Object> out = new HashMap<>();
            out.put("local", true);
            Map<String, Object> u = new HashMap<>();
            u.put("id", user.getId());
            u.put("email", user.getEmail());
            out.put("user", u);
            System.out.println("Authenticated " + email + " via local DB");
            return out;
        } catch (Exception e) {
            // On any exception calling Firebase, fallback to local login here
            System.out.println("Firebase sign-in failed for " + email + ", falling back to local login: " + e.getMessage());
            System.out.println("podpofpofpsofpsofs");
            User user = login(email, password);
            Map<String, Object> out = new HashMap<>();
            out.put("local", true);
            Map<String, Object> u = new HashMap<>();
            u.put("id", user.getId());
            u.put("email", user.getEmail());
            out.put("user", u);
            System.out.println("Authenticatedeee " + email + " via local DB");
            return out;
        }
    }

}
