package com.projet.lalana.controller;

import com.projet.lalana.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signIn(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "email and password are required");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            Map<String, Object> resp = authService.authenticate(email, password);

            if (resp.containsKey("status") && resp.containsKey("error")) {
                Object statusObj = resp.get("status");
                int status = 400;
                if (statusObj instanceof Number) status = ((Number) statusObj).intValue();
                return ResponseEntity.status(status).body(resp);
            }

            return ResponseEntity.ok(resp);
        } catch (com.projet.lalana.service.ServiceException se) {
            Map<String, Object> err = new java.util.HashMap<>();
            err.put("error", se.getMessage());
            return ResponseEntity.status(401).body(err);
        } catch (Exception e) {
            Map<String, Object> err = new java.util.HashMap<>();
            err.put("error", "Internal server error");
            return ResponseEntity.status(500).body(err);
        }
    }
}
